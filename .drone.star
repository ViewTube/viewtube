architectures = [
    'amd64',
    'arm'
]

version = '0.9.1'

repo = 'mauriceo/viewtube'

stableTagsArray = [
    'latest',
    version,
    version[:-2]
]


def main(ctx):
    stages = []
    for arch in architectures:
        stages.append(step(arch))

    after = [
        manifest('dev', 'development')
    ]
    for stableTag in stableTagsArray:
        after.append(manifest(stableTag, 'stable'))

    return [pullrequest()] + stages + after


def step(arch):
    return {
        'kind': 'pipeline',
        'type': 'docker',
        'name': 'build-%s' % arch,
        'platform': {
            'arch': arch,
            'os': 'linux'
        },
        'trigger': {
            'branch': [
                'development',
                'stabe'
            ],
            'event': [
                'push'
            ]
        },
        'steps': [
            publishStep(
                stableTagsArray,
                'stable'
            ),
            publishStep(
                [
                    'dev'
                ],
                'development'
            )
        ]
    }


def publishStep(tags, branch):
    return {
        'name': 'publish-%s' % branch,
        'image': 'plugins/docker',
        'pull': 'if-not-exists',
        'settings': {
            'repo': repo,
            'compress': 'true',
            'cache_from': repo + ':' + tags[0],
            'tags': tags,
            'username': {
                'from_secret': 'docker_username'
            },
            'password': {
                'from_secret': 'docker_password'
            }
        },
        'when': {
            'branch': [
                branch
            ],
            'event': [
                'push'
            ]
        }
    }


def pullrequest():
    stepVolumes = [
        {
            'name': 'installcache',
            'path': '/installcache'
        }
    ]
    return {
        'kind': 'pipeline',
        'type': 'docker',
        'name': 'pull-request',
        'volumes': [
            {
                'name': 'installcache',
                'temp': {}
            }
        ],
        'trigger': {
            'branch': [
                'development'
            ],
            'event': [
                'pull_request'
            ]
        },
        'steps': [
            {
                'name': 'install',
                'image': 'node:16',
                'pull': 'if-not-exists',
                'volumes': stepVolumes,
                'commands': [
                    'yarn install'
                ]
            },
            {
                'name': 'build-client',
                'image': 'node:16',
                'pull': 'if-not-exists',
                'volumes': stepVolumes,
                'commands': [
                    'yarn build:client'
                ],
                'depends_on':[
                    'install'
                ]
            },
            {
                'name': 'build-server',
                'image': 'node:16',
                'pull': 'if-not-exists',
                'volumes': stepVolumes,
                'commands': [
                    'yarn build:server'
                ],
                'depends_on': [
                    'install'
                ]
            },
            {
                'name': 'test',
                'image': 'mauriceo/nodejs-mongodb:1.0',
                'pull': 'if-not-exists',
                'volumes': stepVolumes,
                'commands': [
                    'yarn test'
                ],
                'depends_on':[
                    'install'
                ]
            }
        ]
    }


def manifest(tag, branch):
    dependencies = []
    for arch in architectures:
        dependencies.append('build-' + arch)

    platforms = []
    for arch in architectures:
        platforms.append('linux/' + arch)
    return {
        'kind': 'pipeline',
        'type': 'docker',
        'name': 'manifest-%s' % tag,
        'steps': [
            {
                'name': 'manifest',
                'image': 'plugins/manifest',
                'settings': {
                    'username': {
                        'from-secret': 'docker_username'
                    },
                    'password': {
                        'from_secret': 'docker_password'
                    },
                    'target': repo + ':' + tag,
                    'template': repo + ':' + tag + '-OS-ARCH',
                    'platforms': platforms,
                    'ignore_missing': 'true',
                },
            },
        ],
        'depends_on': dependencies,
        'trigger': {
            'event': ['push'],
            'branch': [branch]
        }
    }
