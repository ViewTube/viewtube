import { CacheModule, Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import * as Sentry from '@sentry/node';
import { RedisOptions } from 'ioredis';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CacheConfigService } from './cache-config.service';
import { SentryModule } from './sentry/sentry.module';
import { SentryInterceptor } from './sentry/sentry.interceptor';

const redisPort = isNaN(parseInt(process.env.VIEWTUBE_REDIS_PORT))
  ? 6379
  : parseInt(process.env.VIEWTUBE_REDIS_PORT);

const redisOptions: RedisOptions = {
  host: process.env.VIEWTUBE_REDIS_HOST,
  port: redisPort
};

if (process.env.VIEWTUBE_REDIS_PASSWORD) {
  redisOptions.password = process.env.VIEWTUBE_REDIS_PASSWORD;
}

const moduleMetadata: ModuleMetadata = {
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const uri = `mongodb://${process.env.VIEWTUBE_DATABASE_HOST}:${process.env.VIEWTUBE_DATABASE_PORT}/viewtube`;
        return {
          uri,
          user: process.env.VIEWTUBE_DATABASE_USER,
          pass: process.env.VIEWTUBE_DATABASE_PASSWORD
        };
      }
    }),
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      release: process.env.SENTRY_RELEASE,
      enabled: Boolean(process.env.SENTRY_DSN && process.env.SENTRY_RELEASE),
      environment: 'production',
      integrations: [new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true })],
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLERATE)
    }),
    CacheModule.registerAsync({
      useClass: CacheConfigService
    }),
    BullModule.forRoot({
      redis: {
        ...redisOptions,
        db: 1
      }
    }),
    ThrottlerModule.forRoot({
      ttl: 600,
      limit: 1000,
      storage: new ThrottlerStorageRedisService({ ...redisOptions, db: 3 })
    }),
    ScheduleModule.forRoot(),
    CoreModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot()
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor
    }
  ]
};
@Module(moduleMetadata)
export class AppModule {}
