import FastifyCookie from '@fastify/cookie';
import FastifyHelmet from '@fastify/helmet';
import FastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { isHttps } from '@viewtube/shared';
import cluster from 'cluster';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import { access, mkdir } from 'fs/promises';
import path from 'path';
import { ConfigurationService } from 'server/core/configuration/configuration.service';
import webPush from 'web-push';
import { version } from '../../package.json';
import { AdminService } from './admin/admin.service';
import { AppClusterService } from './app-cluster.service';
import { AppModule } from './app.module';
import { logger } from './common/logger';
import { ModuleType } from './common/module.type';
import { checkRedisConnection } from './common/redis.connection';
import { registerFastifyPlugin } from './common/registerFastifyPlugin';
import metadata from './metadata';
import { NuxtService } from './nuxt/nuxt.service';
import { SubscriptionsService } from './user/subscriptions/subscriptions.service';

declare const module: ModuleType;

const bootstrap = async () => {
  await ConfigurationService.initializeEnvironment();

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
    logger
  });
  global.nestApp = app;

  const configService = app.get(ConfigService);
  const adminService = app.get(AdminService);
  const serverSettings = await adminService.getServerSettings();
  const registrationEnabled = serverSettings.registrationEnabled;
  global.requireLoginEverywhere = serverSettings.requireLoginEverywhere;
  process.env.NUXT_PUBLIC_REGISTRATION_ENABLED = registrationEnabled.toString();
  process.env.NUXT_PUBLIC_REQUIRE_LOGIN_EVERYWHERE =
    serverSettings.requireLoginEverywhere.toString();

  const isProduction = configService.get('NODE_ENV') === 'production';
  logger.log(`Running in ${isProduction ? 'production' : 'development'} mode`);
  logger.log(`Registration is ${registrationEnabled ? 'enabled' : 'disabled'}`);
  logger.log(`Login is required everywhere: ${global.requireLoginEverywhere}`);

  await checkRedisConnection();

  webPush.setVapidDetails(
    'https://github.com/ViewTube/viewtube',
    ConfigurationService.publicVapidKey ?? '',
    ConfigurationService.privateVapidKey ?? ''
  );

  global.__basedir = __dirname;
  if (configService.get('VIEWTUBE_DATA_DIRECTORY')) {
    global.__basedir = configService.get('VIEWTUBE_DATA_DIRECTORY');
  }
  if (!isProduction) {
    global.__basedir = path.join(__dirname, global.__basedir);
  }

  if (isProduction) {
    const channelsDir = `${global.__basedir}/channels`;
    const profilesDir = `${global.__basedir}/profiles`;
    try {
      await access(channelsDir);
    } catch {
      await mkdir(channelsDir);
    }
    try {
      await access(profilesDir);
    } catch {
      await mkdir(profilesDir);
    }
  }

  const subscriptionsService = app.get(SubscriptionsService);
  void subscriptionsService.initializeSubscriptionTask();

  // Disables helment on non-https instances
  if (isHttps()) {
    await registerFastifyPlugin(app, FastifyHelmet, {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: [`'self'`, `blob:`, `data:`],
          scriptSrc: [
            `'self'`,
            `blob:`,
            `https: 'unsafe-eval'`,
            `https: 'unsafe-inline'`,
            '*.viewtube.io'
          ],
          scriptSrcAttr: null
        }
      }
    });
  }

  await registerFastifyPlugin(app, FastifyCookie);
  await registerFastifyPlugin(app, FastifyMultipart);

  // NUXT
  if (isProduction) {
    const nuxtService = app.get(NuxtService);
    await nuxtService.init();
    await registerFastifyPlugin(app, fastifyStatic, {
      root: path.resolve(nuxtService.nuxtPath, 'public'),
      serve: false
    });
  }

  // NEST
  const port = configService.get<number>('PORT');

  // CORS
  const allowedOrigin = configService.get<string>('VIEWTUBE_CORS_ORIGIN');
  if (isProduction && allowedOrigin) {
    app.enableCors({
      origin: allowedOrigin,
      credentials: true
    });
  }

  // SWAGGER DOCS
  const documentOptions = new DocumentBuilder()
    .setTitle('ViewTube API')
    .setDescription('ViewTube, an alternative Youtube frontend.')
    .setVersion(`Version ${version}`)
    .setLicense('AGPLv3', 'https://raw.githubusercontent.com/viewtube/viewtube/development/LICENSE')
    .addBearerAuth()
    .build();

  await SwaggerModule.loadPluginMetadata(metadata);
  const swaggerDocument = SwaggerModule.createDocument(app, documentOptions);

  if (process.env.GENERATE_SWAGGER === 'true') {
    fs.writeFileSync('./swagger-spec.json', JSON.stringify(swaggerDocument));
    process.exit(0);
  }

  SwaggerModule.setup('/api', app, swaggerDocument);

  app.use(cookieParser());

  app.enableShutdownHooks();

  // START
  await app.listen(port, '::', (err, _address) => {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    if ((cluster.worker && cluster.worker.id === 1) || !AppClusterService.isClustered) {
      logger.log(`Server listening on ${_address}`);
    }
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
};

const runBootstrap = async () => {
  if (AppClusterService.isClustered) {
    if (cluster.worker && cluster.worker.id === 1) {
      logger.log('Starting in clustered mode');
    }
    AppClusterService.clusterize(bootstrap);
  } else {
    logger.log('Starting with single node');
    await bootstrap();
  }
};

process.on('warning', e => {
  if (process.env.NODE_ENV === 'production') return;
  logger.warn(e);
  logger.warn(e.stack);
});
runBootstrap();
