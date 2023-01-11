import fs from 'fs';
import path from 'path';
import cluster from 'cluster';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import webPush from 'web-push';
import Consola from 'consola';
import FastifyCookie from '@fastify/cookie';
import FastifyMultipart from '@fastify/multipart';
import FastifyHelmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { HomepageService } from './core/homepage/homepage.service';
import { AppClusterService } from './app-cluster.service';
import { promisify } from 'util';
import { ConfigurationService } from 'server/core/configuration/configuration.service';
import { isHttps } from 'viewtube/shared/index';
import { NuxtService } from './nuxt/nuxt.service';
import { FastifyPluginCallback } from 'fastify';

declare const module: {
  hot: {
    accept: () => void;
    dispose: (callback: () => void) => void;
  };
};

type FastifyPluginType = FastifyPluginCallback;

const bootstrap = async () => {
  await ConfigurationService.initializeEnvironment();
  const server = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: ['error', 'warn']
  });

  const configService = server.get(ConfigService);

  const isProduction = configService.get('NODE_ENV') === 'production';
  Consola.info(`Running in ${isProduction ? 'production' : 'development'} mode`);

  webPush.setVapidDetails(
    'https://github.com/ViewTube/viewtube-vue',
    ConfigurationService.publicVapidKey || '',
    ConfigurationService.privateVapidKey || ''
  );

  global['__basedir'] = __dirname;
  if (configService.get('VIEWTUBE_DATA_DIRECTORY')) {
    global['__basedir'] = configService.get('VIEWTUBE_DATA_DIRECTORY');
  }
  if (!isProduction) {
    global['__basedir'] = path.join(__dirname, global['__basedir']);
  }

  if (isProduction) {
    const channelsDir = `${(global as any).__basedir}/channels`;
    const profilesDir = `${(global as any).__basedir}/profiles`;
    const folderExists = promisify(fs.access);
    const createFolder = promisify(fs.mkdir);
    try {
      await folderExists(channelsDir);
    } catch {
      await createFolder(channelsDir);
    }
    try {
      await folderExists(profilesDir);
    } catch {
      await createFolder(profilesDir);
    }
  }

  // Disable helment on non-https instances
  if (isHttps()) {
    await server.register(
      FastifyHelmet as FastifyPluginType,
      {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            defaultSrc: [
              `'self'`,
              `blob:`,
              `https://sponsor.ajay.app`,
              `https://*.googlevideo.com`
            ],
            scriptSrc: [`'self'`, `blob:`, `https: 'unsafe-eval'`, `https: 'unsafe-inline'`],
            scriptSrcAttr: null
          }
        }
      } as any
    );
  }

  await server.register(FastifyCookie as FastifyPluginType);
  await server.register(FastifyMultipart as FastifyPluginType);

  // NUXT
  if (isProduction) {
    const nuxtService = server.get(NuxtService);
    await nuxtService.init();

    server.useStaticAssets({
      root: path.resolve(nuxtService.nuxtPath, 'public'),
      wildcard: false,
      maxAge: 31536000
    });
  }

  // NEST
  const port = configService.get<number>('PORT');

  // CORS
  const allowedOrigin = configService.get<string>('VIEWTUBE_CORS_ORIGIN');
  if (isProduction && allowedOrigin) {
    server.enableCors({
      origin: allowedOrigin,
      credentials: true
    });
  }

  // SWAGGER DOCS
  const documentOptions = new DocumentBuilder()
    .setTitle('ViewTube-API')
    .setDescription('ViewTube, an alternative Youtube frontend.')
    .setVersion('Version 0.9.1')
    .setLicense(
      'AGPLv3',
      'https://raw.githubusercontent.com/viewtube/viewtube-vue/development/LICENSE'
    )
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(server, documentOptions);

  if (process.env.GENERATE_SWAGGER === 'true') {
    fs.writeFileSync('./swagger-spec.json', JSON.stringify(swaggerDocument));
    process.exit(0);
  }

  SwaggerModule.setup('/api', server, swaggerDocument);

  server.use(cookieParser());

  server.enableShutdownHooks();
  // START
  await server.listen(port, '0.0.0.0', (err, _address) => {
    if (err) {
      Consola.error(err);
      process.exit(1);
    }
    if ((cluster.worker && cluster.worker.id === 1) || !AppClusterService.isClustered) {
      Consola.ready(`Server listening on ${_address}`);
    }
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.close());
  }

  const homepageService = server.get(HomepageService);
  await homepageService.refreshPopular();
};

const runBootstrap = async () => {
  if (AppClusterService.isClustered) {
    if (cluster.worker && cluster.worker.id === 1) {
      Consola.start('Starting in clustered mode');
    }
    AppClusterService.clusterize(bootstrap);
  } else {
    Consola.start('Starting with single node');
    await bootstrap();
  }
};

runBootstrap();
