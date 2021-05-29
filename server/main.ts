import fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import webPush from 'web-push';
import Consola from 'consola';
import packageJson from '../package.json';
import { AppModule } from './app.module';
import { NuxtFilter } from './nuxt/nuxt.filter';
import NuxtServer from './nuxt/';
import { HomepageService } from './core/homepage/homepage.service';

async function bootstrap() {
  const server = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = server.get(ConfigService);

  const dev = configService.get('NODE_ENV') !== 'production';
  // NUXT
  const nuxt = await NuxtServer.getInstance().run(dev);

  // NEST
  server.useGlobalFilters(new NuxtFilter(nuxt));

  server.setGlobalPrefix('api');

  // CORS
  const port = configService.get('PORT');
  const corsDomains = configService.get('VIEWTUBE_ALLOWED_DOMAINS').trim().split(',');
  if (configService.get('NODE_ENV') !== 'production') {
    corsDomains.push('http://localhost:8066');
  }

  server.enableCors();

  // PUSH NOTIFICATIONS
  webPush.setVapidDetails(
    `mailto:${packageJson.email}`,
    configService.get('VIEWTUBE_PUBLIC_VAPID') || '',
    configService.get('VIEWTUBE_PRIVATE_VAPID') || ''
  );

  // DATA STORAGE CONFIG

  (global as any).__basedir = __dirname;
  if (configService.get('VIEWTUBE_DATA_DIRECTORY')) {
    (global as any).__basedir = configService.get('VIEWTUBE_DATA_DIRECTORY');
  }
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
    Consola.ready(`Server listening on http://localhost:${port}`);
  });

  const homepageService = server.get(HomepageService);
  homepageService.refreshPopular();
}
bootstrap();
