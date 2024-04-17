import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import type { ModuleMetadata, Type } from '@nestjs/common';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import type { RedisOptions } from 'ioredis';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CaptchaModule } from './auth/captcha/captcha.module';
import { RegisterModule } from './auth/register/register.module';
import { CacheConfigService } from './cache-config.service';
import { AutocompleteModule } from './core/autocomplete/autocomplete.module';
import { ChannelsModule } from './core/channels/channels.module';
import { CommentsModule } from './core/comments/comments.module';
import { CoreModule } from './core/core.module';
import { HomepageModule } from './core/homepage/homepage.module';
import { PlaylistsModule } from './core/playlists/playlists.module';
import { ProxyModule } from './core/proxy/proxy.module';
import { SearchModule } from './core/search/search.module';
import { validationSchema } from './env.validation';
import { NuxtModule } from './nuxt/nuxt.module';
import { HistoryModule } from './user/history/history.module';
import { NotificationsModule } from './user/notifications/notifications.module';
import { SettingsModule } from './user/settings/settings.module';
import { SubscriptionsModule } from './user/subscriptions/subscriptions.module';
import { UserModule } from './user/user.module';

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
    ScheduleModule.forRoot(),
    AuthModule,
    CoreModule,
    UserModule,
    NuxtModule,
    AdminModule,
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
  providers: [Logger]
};
@Module(moduleMetadata)
export class AppModule {}
