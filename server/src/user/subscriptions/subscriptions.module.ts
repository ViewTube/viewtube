import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { ModuleMetadata } from '@nestjs/common';
import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheConfigService } from 'server/cache-config.service';
import { General, GeneralSchema } from 'server/common/general.schema';
import {
  ChannelBasicInfo,
  ChannelBasicInfoSchema
} from 'server/core/channels/schemas/channel-basic-info.schema';
import {
  VideoBasicInfo,
  VideoBasicInfoSchema
} from 'server/core/videos/schemas/video-basic-info.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsProcessor } from './subscriptions.processor';
import { SubscriptionsService } from './subscriptions.service';

const moduleMetadata: ModuleMetadata = {
  imports: [
    MongooseModule.forFeature([
      {
        name: VideoBasicInfo.name,
        schema: VideoBasicInfoSchema,
        collection: 'videos-basicinfo'
      },
      {
        name: ChannelBasicInfo.name,
        schema: ChannelBasicInfoSchema,
        collection: 'channel-basicinfo'
      },
      {
        name: Subscription.name,
        schema: SubscriptionSchema,
        collection: 'subscriptions'
      },
      {
        name: General.name,
        schema: GeneralSchema,
        collection: 'general'
      }
    ]),
    BullModule.registerQueue({
      name: 'subscriptions'
    }),
    CacheModule.registerAsync({
      useClass: CacheConfigService
    }),
    NotificationsModule
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionsProcessor, Logger],
  exports: [SubscriptionsService]
};
@Module(moduleMetadata)
export class SubscriptionsModule {}
