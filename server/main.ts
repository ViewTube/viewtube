import fs from 'fs';
import cluster from 'cluster';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import webPush from 'web-push';
import Consola from 'consola';
import FastifyCookie from 'fastify-cookie';
import FastifyMultipart from 'fastify-multipart';
import FastifyHelmet from 'fastify-helmet';
import packageJson from '../package.json';
import { AppModule } from './app.module';
import { NuxtFilter } from './nuxt/nuxt.filter';
import NuxtServer from './nuxt/';
import { HomepageService } from './core/homepage/homepage.service';
import { checkEnvironmentVariables } from './prerequisiteHelper';
import { AppClusterService } from './app-cluster.service';

declare const module: any;
const dev = process.env.NODE_ENV !== 'production';

const prepareBootstrapPrimary = () => {
  checkEnvironmentVariables();

  if (!dev) {
    const channelsDir = `${(global as any).__basedir}/channels`;
    const profilesDir = `${(global as any).__basedir}/profiles`;
    if (!fs.existsSync(channelsDir)) {
      fs.mkdirSync(channelsDir);
    }
    if (!fs.existsSync(profilesDir)) {
      fs.mkdirSync(profilesDir);
    }
  }
};

const prepareBootstrap = () => {
  webPush.setVapidDetails(
    `mailto:${packageJson.email}`,
    process.env.VIEWTUBE_PUBLIC_VAPID || '',
    process.env.VIEWTUBE_PRIVATE_VAPID || ''
  );

  // eslint-disable-next-line dot-notation
  global['__basedir'] = __dirname;
  if (process.env.VIEWTUBE_DATA_DIRECTORY) {
    // eslint-disable-next-line dot-notation
    global['__basedir'] = process.env.VIEWTUBE_DATA_DIRECTORY;
  }
};

const bootstrap = async () => {
  const server = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: ['error', 'warn', 'log', 'debug', 'verbose']
  });

  await server.register(FastifyHelmet, {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: [`'self'`, `blob:`, `https://sponsor.ajay.app`, `https://*.googlevideo.com`],
        scriptSrc: [`'self'`, `blob:`, `https: 'unsafe-eval'`, `https: 'unsafe-inline'`],
        scriptSrcAttr: null
      }
    }
  });
  await server.register(FastifyCookie);
  await server.register(FastifyMultipart);

  const configService = server.get(ConfigService);

  // NUXT
  if (!configService.get('API_ONLY')) {
    const nuxt = await NuxtServer.getInstance().run(dev);

    server.useGlobalFilters(new NuxtFilter(nuxt));
  }

  // NEST
  server.setGlobalPrefix('api');
  const port = configService.get('PORT');

  // CORS
  const allowedDomain = configService.get<string>('VIEWTUBE_ALLOWED_DOMAIN');
  if (dev && allowedDomain) {
    server.enableCors({ origin: allowedDomain, credentials: true });
  } else if (!allowedDomain.startsWith('/')) {
    server.enableCors({ origin: allowedDomain, credentials: true });
  } else if (!allowedDomain) {
    server.enableCors({ origin: '*' });
  } else {
    server.enableCors({ origin: new RegExp(allowedDomain), credentials: true });
  }

  // SWAGGER DOCS
  const documentOptions = new DocumentBuilder()
    .setTitle('ViewTube-API')
    .setDescription(packageJson.description)
    .setVersion(packageJson.version)
    .setLicense(
      packageJson.license,
      'https://raw.githubusercontent.com/viewtube/viewtube-vue/master/LICENSE'
    )
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(server, documentOptions);
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
      Consola.ready(`Server listening on http://localhost:${port}`);
    }
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.close());
  }

  const homepageService = server.get(HomepageService);
  homepageService.refreshPopular();
};

const runBootstrap = async () => {
  prepareBootstrap();
  if (AppClusterService.isClustered) {
    if (cluster.worker && cluster.worker.id === 1) {
      Consola.start('Starting in clustered mode');
    }
    if (cluster.isPrimary) {
      prepareBootstrapPrimary();
    }
    AppClusterService.clusterize(bootstrap);
  } else {
    Consola.start('Starting with single node');
    prepareBootstrapPrimary();
    await bootstrap();
  }
};

runBootstrap();
