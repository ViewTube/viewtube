architectures = [
    'amd64',
    'arm',
    'arm64'
]

buildOS = 'linux'

version = '0.9.1'

repo = 'mauriceo/viewtube'

stableTagsArray = [
    'latest',
    version,
    version[:-2]
]

devTagsArray = [
    'dev'
]


def addArchMap(tags, arch):
    archTagsArray = []
    for curTag in tags:
        tagArchName = '%s-%s-%s' % (curTag, buildOS, arch)
        archTagsArray.append(tagArchName)

    return archTagsArray


def main(ctx):
    stages = []
    after = []

    for arch in architectures:
        stages.append(step(arch))

    for devTag in devTagsArray:
        after.append(manifest(devTag, 'development'))

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
            'os': buildOS
        },
        'trigger': {
            'branch': [
                'development',
                'stable'
            ],
            'event': [
                'push'
            ]
        },
        'steps': [
            publishStep(
                addArchMap(stableTagsArray, arch),
                'stable',
                arch
            ),
            publishStep(
                addArchMap(devTagsArray, arch),
                'development',
                arch
            )
        ]
    }


def publishStep(tags, branch, arch):
    return {
        'name': 'publish-%s' % branch,
        'image': 'thegeeklab/drone-docker-buildx',
        'pull': 'if-not-exists',
        'environment': {
            'GOOS': buildOS,
            'GOARCH': arch
        },
        'privileged': True,
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
                        'from_secret': 'docker_username'
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
