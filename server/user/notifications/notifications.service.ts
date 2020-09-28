import { Injectable } from '@nestjs/common';
import webPush from 'web-push';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
import { NotificationsSubscription } from './schemas/notifications-subscription.schema';
import { PushNotification } from './schemas/push-notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(NotificationsSubscription.name)
    private readonly NotificationsSubscriptionModel: Model<NotificationsSubscription>,
    @InjectModel(PushNotification.name)
    private readonly PushNotificationModel: Model<PushNotification>
  ) {}

  createNotificationsSubscription(
    subscription: webPush.PushSubscription,
    username: string
  ): Promise<NotificationsSubscription> {
    const notificationsSubscription = new this.NotificationsSubscriptionModel({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      username
    });

    return notificationsSubscription.save();
  }

  async sendNotification(username: string, jsonPayload: any): Promise<void> {
    const userSubscriptions = await this.NotificationsSubscriptionModel.find({ username })
      .lean()
      .exec();
    if (userSubscriptions) {
      const payload = JSON.stringify(jsonPayload);

      userSubscriptions.forEach(subscription => {
        webPush
          .sendNotification(subscription, payload)
          .then(
            () => {
              console.log('sent notification to ' + username);
            },
            reason => {
              console.log('notification rejected', reason);
              if (reason.statusCode === 410 || reason.statusCode === 404) {
                this.NotificationsSubscriptionModel.findOneAndDelete(subscription).exec();
              }
            }
          )
          .catch(err => console.log('error', err));
      });
    }
  }

  async sendVideoNotification(username: string, video: VideoBasicInfoDto): Promise<void> {
    if (
      !(await this.PushNotificationModel.exists({
        username,
        id: video.videoId
      }))
    ) {
      const notificationPayload = {
        title: `New video from ${video.author}`,
        body: `${video.title}\n${video.description}`,
        video
      };
      await new this.PushNotificationModel({
        id: video.videoId,
        username,
        content: notificationPayload
      }).save();
      await this.sendNotification(username, notificationPayload);
    }
  }
}
