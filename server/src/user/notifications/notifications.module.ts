import { Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import {
  NotificationsSubscription,
  NotificationsSubscriptionSchema
} from './schemas/notifications-subscription.schema';
import { PushNotification, PushNotificationSchema } from './schemas/push-notification.schema';

const moduleMetadata: ModuleMetadata = {
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: NotificationsSubscription.name,
        schema: NotificationsSubscriptionSchema,
        collection: 'notifications-subscriptions'
      },
      {
        name: PushNotification.name,
        schema: PushNotificationSchema,
        collection: 'push-notifications'
      }
    ])
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService]
};
@Module(moduleMetadata)
export class NotificationsModule {}
