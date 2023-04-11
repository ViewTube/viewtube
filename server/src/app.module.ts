import { Logger, Module, ModuleMetadata, Type } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, RouterModule } from '@nestjs/core';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import * as Sentry from '@sentry/node';
import { RedisOptions } from 'ioredis';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CacheConfigService } from './cache-config.service';
import { SentryModule } from './sentry/sentry.module';
import { SentryInterceptor } from './sentry/sentry.interceptor';
import { validationSchema } from './env.validation';
import { NuxtModule } from './nuxt/nuxt.module';
import { AutocompleteModule } from './core/autocomplete/autocomplete.module';
import { ChannelsModule } from './core/channels/channels.module';
import { CommentsModule } from './core/comments/comments.module';
import { HomepageModule } from './core/homepage/homepage.module';
import { PlaylistsModule } from './core/playlists/playlists.module';
import { ProxyModule } from './core/proxy/proxy.module';
import { SearchModule } from './core/search/search.module';
import { CaptchaModule } from './auth/captcha/captcha.module';
import { RegisterModule } from './auth/register/register.module';
import { HistoryModule } from './user/history/history.module';
import { NotificationsModule } from './user/notifications/notifications.module';
import { SettingsModule } from './user/settings/settings.module';
import { SubscriptionsModule } from './user/subscriptions/subscriptions.module';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import { AdminModule } from './user/admin/admin.module';

const prefixApi = (modules: Type<any>[]) => modules.map(module => ({ path: 'api', module }));

const moduleMetadata: ModuleMetadata = {
  imports: [
    ConfigModule.forRoot({
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false
      },
      cache: true,
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const uri = `mongodb://${configService.get('VIEWTUBE_DATABASE_HOST')}:${configService.get(
          'VIEWTUBE_DATABASE_PORT'
        )}/viewtube`;
        return {
          uri,
          user: configService.get('VIEWTUBE_DATABASE_USER'),
          pass: configService.get('VIEWTUBE_DATABASE_PASSWORD')
        };
      },
      inject: [ConfigService]
    }),
    SentryModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          dsn: configService.get('SENTRY_DSN'),
          release: configService.get('SENTRY_RELEASE'),
          enabled: Boolean(configService.get('SENTRY_DSN') && configService.get('SENTRY_RELEASE')),
          environment: 'production',
          integrations: [new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true })],
          tracesSampleRate: configService.get<number>('SENTRY_TRACES_SAMPLERATE')
        };
      },
      inject: [ConfigService]
    }),
    CacheModule.registerAsync({
      useClass: CacheConfigService
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const redisOptions: RedisOptions = {
          host: configService.get('VIEWTUBE_REDIS_HOST'),
          port: configService.get<number>('VIEWTUBE_REDIS_PORT')
        };

        if (configService.get('VIEWTUBE_REDIS_PASSWORD')) {
          redisOptions.password = configService.get('VIEWTUBE_REDIS_PASSWORD');
        }

        return {
          redis: {
            ...redisOptions,
            db: 1
          }
        };
      },
      inject: [ConfigService]
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const redisOptions: RedisOptions = {
          host: configService.get('VIEWTUBE_REDIS_HOST'),
          port: configService.get<number>('VIEWTUBE_REDIS_PORT')
        };

        if (configService.get('VIEWTUBE_REDIS_PASSWORD')) {
          redisOptions.password = configService.get('VIEWTUBE_REDIS_PASSWORD');
        }

        return {
          ttl: 600,
          limit: 1000,
          storage: new ThrottlerStorageRedisService({ ...redisOptions, db: 3 })
        };
      },
      inject: [ConfigService]
    }),
    ScheduleModule.forRoot(),
    CoreModule,
    UserModule,
    AuthModule,
    NuxtModule,
    RouterModule.register(
      prefixApi([
        AuthModule,
        CaptchaModule,
        RegisterModule,
        CoreModule,
        AutocompleteModule,
        ChannelsModule,
        CommentsModule,
        HomepageModule,
        PlaylistsModule,
        ProxyModule,
        SearchModule,
        UserModule,
        HistoryModule,
        NotificationsModule,
        SettingsModule,
        SubscriptionsModule,
        AdminModule
      ])
    )
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor
    },
    Logger
  ]
};
@Module(moduleMetadata)
export class AppModule {}
