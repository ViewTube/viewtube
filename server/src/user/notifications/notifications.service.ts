import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
import webPush from 'web-push';
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
    if (!userSubscriptions) return;
    
    const payload = JSON.stringify(jsonPayload);

    userSubscriptions.forEach(subscription => {
      webPush
        .sendNotification(subscription, payload)
        .then(
          () => {
            // Ignore silently
          },
          reason => {
            if (reason.statusCode === 410 || reason.statusCode === 404) {
              this.NotificationsSubscriptionModel.findOneAndDelete({
                _id: subscription._id
              }).exec();
            }
          }
        )
        .catch(_ => {
          // Ignore silently
        });
    });
  }

  async sendMultipleNotifications(
    notifications: Array<{ username: string; videos: Array<VideoBasicInfoDto> }>
  ) {
    const pushNotifications = await this.PushNotificationModel.find().lean().exec();
    const notificationsToSave = [];
    await Promise.allSettled(
      notifications.map(async notification => {
        await Promise.allSettled(
          notification.videos.map(async video => {
            if (
              pushNotifications.findIndex(
                el => el.username === notification.username && el.id === video.videoId
              ) === -1
            ) {
              const notificationPayload = {
                title: `New video from ${video.author}`,
                body: `${video.title}\n${video.description}`,
                video
              };
              await this.sendNotification(notification.username, notificationPayload);
              notificationsToSave.push({
                insertOne: {
                  document: {
                    id: video.videoId,
                    username: notification.username,
                    content: notificationPayload
                  }
                }
              });
            }
          })
        );
      })
    );
    await this.PushNotificationModel.bulkWrite(notificationsToSave);
  }

  async sendVideoNotification(username: string, video: VideoBasicInfoDto): Promise<void> {
    const notificationExists = await this.PushNotificationModel.exists({
      username,
      id: video.videoId
    });

    if (notificationExists) return;

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
