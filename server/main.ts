import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import packageJson from "../package.json";
import cookieParser from "cookie-parser";
import webPush from 'web-push';
import fs from 'fs';
import { NuxtFilter } from './nuxt/nuxt.filter';
import NuxtServer from './nuxt/';
import config from '../nuxt.config.js';

declare const module: any;

async function bootstrap() {
  const dev = process.env.NODE_ENV !== 'production';
  // NUXT
  const nuxt = await NuxtServer.getInstance().run(
    dev ? !module.hot._main : true
  );

  // NEST
  const server = await NestFactory.create<NestExpressApplication>(AppModule);

  server.use(nuxt.render);

  server.useGlobalFilters(new NuxtFilter(nuxt));

  // CORS
  const configService = server.get(ConfigService);
  const port = configService.get('PORT');
  const corsDomains = configService.get('VIEWTUBE_ALLOWED_DOMAINS').trim().split(',');
  if (configService.get('NODE_ENV') !== 'production') {
    corsDomains.push('http://localhost:8066');
  }

  server.enableCors({
    origin: corsDomains,
    credentials: true
  });

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
  if (!fs.existsSync(global['__basedir'] + '/channels')) {
    fs.mkdirSync(global['__basedir'] + '/channels');
  }

  // SWAGGER DOCS
  const documentOptions = new DocumentBuilder()
    .setTitle('ViewTube-API')
    .setDescription(packageJson.description)
    .setVersion(packageJson.version)
    .setLicense(packageJson.license, 'https://raw.githubusercontent.com/mauriceoegerli/viewtube-api/master/LICENSE')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(server, documentOptions);
  SwaggerModule.setup('/docs', server, swaggerDocument);

  server.use(cookieParser());

  // START
  await server.listen(port);

  if (dev && module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.close());
  }
}
bootstrap();
