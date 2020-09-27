import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import packageJson from '../package.json';
import cookieParser from 'cookie-parser';
import webPush from 'web-push';
import fs from 'fs';
import { NuxtFilter } from './nuxt/nuxt.filter';
import NuxtServer from './nuxt/';
import config from '../nuxt.config.js';
import Consola from 'consola';
import path from 'path';

async function bootstrap() {
  const server = await NestFactory.create<NestExpressApplication>(AppModule);

  const dev = process.env.NODE_ENV !== 'production';
  // NUXT
  const nuxt = await NuxtServer.getInstance().run(dev);

  // NEST
  server.useGlobalFilters(new NuxtFilter(nuxt));

  server.setGlobalPrefix('api');

  // CORS
  const configService = server.get(ConfigService);
  const port = configService.get('PORT');
  const corsDomains = configService.get('VIEWTUBE_ALLOWED_DOMAINS').trim().split(',');
  if (configService.get('NODE_ENV') !== 'production') {
    corsDomains.push('http://localhost:8066');
  }

  server.enableCors();

  // PUSH NOTIFICATIONS
  webPush.setVapidDetails(
    `mailto:${packageJson.email}`,
    configService.get('VIEWTUBE_PUBLIC_VAPID'),
    configService.get('VIEWTUBE_PRIVATE_VAPID')
  );

  // DATA STORAGE CONFIG

  global['__basedir'] = __dirname;
  if (configService.get('VIEWTUBE_DATA_DIRECTORY')) {
    global['__basedir'] = configService.get('VIEWTUBE_DATA_DIRECTORY');
  }
  if (!dev) {
    const channelsDir = `${global['__basedir']}/channels`;
    if (!fs.existsSync(channelsDir)) {
      console.log(channelsDir, 'basedir: ' + __dirname);
      fs.mkdirSync(channelsDir);
    }
  }

  // SWAGGER DOCS
  const documentOptions = new DocumentBuilder()
    .setTitle('ViewTube-API')
    .setDescription(packageJson.description)
    .setVersion(packageJson.version)
    .setLicense(
      packageJson.license,
      'https://raw.githubusercontent.com/mauriceoegerli/viewtube-api/master/LICENSE'
    )
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(server, documentOptions);
  SwaggerModule.setup('/api', server, swaggerDocument);

  server.use(cookieParser());

  // START
  await server.listen(port, () => {
    Consola.ready({
      message: `Server listening on http://localhost:${port}`,
      badge: true
    });
  });
}
bootstrap();
