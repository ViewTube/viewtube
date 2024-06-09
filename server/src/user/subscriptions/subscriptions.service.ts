import { InjectQueue } from '@nestjs/bull';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Queue } from 'bull';
import cluster from 'cluster';
import { Model } from 'mongoose';
import { AppClusterService } from 'server/app-cluster.service';
import { General } from 'server/common/general.schema';
import { Sorting } from 'server/common/sorting.type';
import { ChannelBasicInfoDto } from 'server/core/channels/dto/channel-basic-info.dto';
import { ChannelBasicInfo } from 'server/core/channels/schemas/channel-basic-info.schema';
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
import { VideoBasicInfo } from 'server/core/videos/schemas/video-basic-info.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { SubscribedChannelsResponseDto } from './dto/subscribed-channels-response.dto';
import { SubscriptionFeedResponseDto } from './dto/subscription-feed-response.dto';
import { SubscriptionStatusDto } from './dto/subscription-status.dto';
import { Subscription } from './schemas/subscription.schema';
import { SubscriptionsQueueParams } from './subscriptions.processor';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(VideoBasicInfo.name)
    private readonly VideoModel: Model<VideoBasicInfo>,
    @InjectModel(Subscription.name)
    private readonly SubscriptionModel: Model<Subscription>,
    @InjectModel(ChannelBasicInfo.name)
    private readonly ChannelBasicInfoModel: Model<ChannelBasicInfo>,
    @InjectModel(General.name)
    private readonly GeneralModel: Model<General>,
    @InjectQueue('subscriptions')
    private subscriptionsQueue: Queue<SubscriptionsQueueParams>,
    private notificationsService: NotificationsService,
    private readonly logger: Logger,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  async initializeSubscriptionTask() {
    const timeInMilliseconds = this.getSubscriptionIntervalTime() * 1000 * 60;
    const interval = setInterval(this.collectSubscriptionsJob.bind(this), timeInMilliseconds);

    this.collectSubscriptionsJob();

    this.schedulerRegistry.addInterval('collectSubscriptions', interval);
  }

  private getSubscriptionIntervalTime() {
    return parseInt(process.env.VIEWTUBE_SUBSCRIPTION_INTERVAL_TIME);
  }

  async collectSubscriptionsJob(): Promise<void> {
    if ((cluster.worker && cluster.worker.id === 1) || !AppClusterService.isClustered) {
      const userSubscriptions = await this.SubscriptionModel.find().lean(true).exec();

      this.subscriptionsQueue.add({
        userSubscriptions
      });
    }
  }

  async saveChannelBasicInfo(channel: ChannelBasicInfoDto): Promise<ChannelBasicInfoDto | null> {
    const savedChannel = await this.ChannelBasicInfoModel.findOneAndUpdate(
      { authorId: channel.authorId },
      channel,
      {
        upsert: true,
        omitUndefined: true,
        new: true
      }
    )
      .exec()
      .catch(_ => this.logger.error('Error saving channel info for id ' + channel.authorId));
    return savedChannel || null;
  }

  async saveVideoBasicInfo(video: VideoBasicInfoDto): Promise<VideoBasicInfoDto | null> {
    const savedVideo = await this.VideoModel.findOneAndUpdate({ videoId: video.videoId }, video, {
      upsert: true
    }).exec();
    return savedVideo || null;
  }

  async sendUserNotifications(videos: Array<VideoBasicInfoDto>): Promise<void> {
    const users = await this.SubscriptionModel.find().lean().exec();
    const notificationsToSend: Array<{ username: string; videos: Array<VideoBasicInfoDto> }> = [];
    videos.forEach(video => {
      const subscribedUsers = users.filter(u =>
        u.subscriptions.find(sub => sub.channelId === video.authorId)
      );
      if (subscribedUsers) {
        subscribedUsers.forEach(user => {
          const channelSubscription = user.subscriptions.find(e => e.channelId === video.authorId);
          if (
            channelSubscription.createdAt &&
            channelSubscription.createdAt.valueOf() < video.published
          ) {
            const notification = notificationsToSend.find(
              notification => notification.username === user.username
            );
            if (notification) {
              notification.videos.push(video);
            } else {
              notificationsToSend.push({ username: user.username, videos: [video] });
            }
          }
        });
      }
    });
    await this.notificationsService.sendMultipleNotifications(notificationsToSend);
  }

  async getSubscribedChannelsCount(username: string): Promise<number> {
    const user = await this.SubscriptionModel.findOne({ username })
      .exec()
      .catch(_ => {
        // Silently drop error
      });

    if (user) {
      return user.subscriptions.length;
    }
    return 0;
  }

  async getSubscribedChannels(
    username: string,
    limit: number,
    start: number,
    sort: Sorting<ChannelBasicInfoDto>,
    filter: string
  ): Promise<SubscribedChannelsResponseDto> {
    const user = await this.SubscriptionModel.findOne({ username })
      .exec()
      .catch(_ => {
        // Silently drop error
      });
    if (user) {
      const userChannelIds = user.subscriptions?.map(e => e.channelId);
      if (userChannelIds) {
        const channelCount = await this.ChannelBasicInfoModel.countDocuments({
          authorId: { $in: userChannelIds },
          author: { $regex: `.*${filter}.*`, $options: 'i' }
        }).exec();
        const channels = await this.ChannelBasicInfoModel.find({
          authorId: { $in: userChannelIds },
          author: { $regex: `.*${filter}.*`, $options: 'i' }
        })
          .sort(sort)
          .skip(parseInt(start as any))
          .limit(parseInt(limit as any))
          .catch(_ => {
            return null;
          });

        if (channels) {
          return {
            channels,
            channelCount
          };
        }
      }
    }
    return { channels: [], channelCount: 0 };
  }

  async getSubscriptionFeed(
    username: string,
    limit: number,
    start: number
  ): Promise<SubscriptionFeedResponseDto> {
    const userSubscriptions = await this.SubscriptionModel.findOne({ username }).lean().exec();
    if (userSubscriptions) {
      const userSubscriptionIds = userSubscriptions.subscriptions.map(e => e.channelId);

      if (typeof limit !== 'number') {
        limit = parseInt('' + limit);
      }
      if (typeof start !== 'number') {
        start = parseInt('' + start);
      }
      if (limit > 30) {
        limit = 30;
      }

      const videoCount = await this.VideoModel.find({
        authorId: { $in: userSubscriptionIds }
      })
        .limit(1000)
        .estimatedDocumentCount()
        .exec();

      const videos = await this.VideoModel.find({ authorId: { $in: userSubscriptionIds } })
        .sort({ published: -1 })
        .limit(limit)
        .skip(start)
        .exec()
        .catch(err => {
          throw new HttpException(`Error fetching subscription feed: ${err}`, 500);
        });

      if (videos) {
        const mappedVideos = videos.map((el: any) => {
          delete el._id;
          delete el.__v;
          return el;
        });
        const channelIds = mappedVideos.map((video: VideoBasicInfoDto) => video.authorId);

        const channelBasicInfoArray = await this.ChannelBasicInfoModel.find({
          authorId: { $in: channelIds }
        }).exec();

        mappedVideos.forEach((video: VideoBasicInfoDto) => {
          const channelInfo = channelBasicInfoArray.find(
            channel => channel.authorId === video.authorId
          );
          if (channelInfo) {
            if (channelInfo.authorThumbnailUrl) {
              video.authorThumbnailUrl = channelInfo.authorThumbnailUrl;
            } else if (channelInfo.authorThumbnails) {
              video.authorThumbnails = channelInfo.authorThumbnails;
            }

            if (channelInfo.authorVerified) {
              video.authorVerified = channelInfo.authorVerified;
            }
          }
        });
        let lastRefresh = null;
        try {
          await this.GeneralModel.findOne({ version: 1 }).then(val => {
            if (val.lastSubscriptionsRefresh) lastRefresh = val.lastSubscriptionsRefresh;
          });
        } catch (error) {
          this.logger.error(error);
        }
        return {
          videos: mappedVideos,
          videoCount,
          lastRefresh,
          refreshInterval: this.getSubscriptionIntervalTime()
        };
      }
    }
    return {
      videos: [],
      videoCount: 0,
      lastRefresh: null,
      refreshInterval: this.getSubscriptionIntervalTime()
    };
  }

  async getSubscription(username: string, channelId: string): Promise<SubscriptionStatusDto> {
    const user = await this.SubscriptionModel.findOne({ username }).exec();
    if (user && user.subscriptions.length > 0) {
      const subscription = user.subscriptions.find(e => e.channelId === channelId);
      if (subscription) {
        return {
          channelId,
          isSubscribed: true
        };
      }
    }
    return {
      channelId,
      isSubscribed: false
    };
  }

  async subscribeToMultipleChannels(
    username: string,
    channels: Array<{ channelId: string; name: string }>
  ): Promise<{
    successful: Array<SubscriptionStatusDto>;
    failed: Array<SubscriptionStatusDto>;
    existing: Array<SubscriptionStatusDto>;
  }> {
    const successful: Array<SubscriptionStatusDto> = [];
    const failed: Array<SubscriptionStatusDto> = [];
    const existing: Array<SubscriptionStatusDto> = [];
    const user = await this.SubscriptionModel.findOne({ username }).exec();
    const subscriptions = user?.subscriptions ?? [];

    channels
      .filter(channel => {
        if (subscriptions.find(e => e.channelId === channel.channelId)) {
          existing.push({ channelId: channel.channelId, isSubscribed: true });
          return false;
        }
        return true;
      })
      .forEach(async channel => {
        if (
          channel?.channelId &&
          typeof channel?.channelId === 'string' &&
          channel?.channelId !== '[object Object]' &&
          channel?.channelId.startsWith('UC') &&
          channel?.channelId.length === 24 &&
          channel?.name &&
          typeof channel?.name === 'string' &&
          channel?.name !== '[object Object]'
        ) {
          if (!subscriptions.find(e => e.channelId === channel.channelId)) {
            subscriptions.push({
              channelId: channel.channelId,
              createdAt: new Date()
            });

            successful.push({
              channelId: channel.channelId,
              name: channel.name,
              isSubscribed: true
            });
          } else {
            existing.push({
              channelId: channel.channelId,
              name: channel.name,
              isSubscribed: true
            });
          }
        } else {
          failed.push({
            channelId: channel.channelId,
            name: channel.name,
            isSubscribed: false
          });
        }
      });

    this.SubscriptionModel.findOneAndUpdate(
      { username },
      { username, subscriptions },
      { upsert: true }
    )
      .exec()
      .catch(_ => {
        throw new InternalServerErrorException('Error updating subscriptions');
      });

    const channelsUpdate = successful.map(channel => {
      const channelInfo = {
        authorId: channel.channelId,
        author: channel.name
      };

      return {
        updateOne: {
          filter: { authorId: channelInfo.authorId },
          update: { $set: channelInfo },
          upsert: true
        }
      };
    });

    await this.ChannelBasicInfoModel.bulkWrite(channelsUpdate).catch(_ => {
      throw new InternalServerErrorException('Error updating channel info');
    });

    return { successful, failed, existing };
  }

  async deleteAllSubscribedChannels(username: string): Promise<{ success: boolean }> {
    let successful = true;
    await this.SubscriptionModel.deleteOne({ username })
      .exec()
      .catch(_ => {
        successful = false;
      });
    return { success: successful };
  }

  /**
   *
   * @param {string} username
   * @param {string} channelId
   *
   * @returns {SubscriptionStatusDto} The subscription status
   */
  async subscribeToChannel(username: string, channelId: string): Promise<SubscriptionStatusDto> {
    const user = await this.SubscriptionModel.findOne({ username }).exec();

    const subscriptions = user ? user.subscriptions : [];
    const currentSubscription = subscriptions.find(e => e.channelId === channelId);

    if (!currentSubscription) {
      subscriptions.push({
        channelId,
        createdAt: new Date()
      });
    }

    await this.SubscriptionModel.findOneAndUpdate(
      { username },
      { username, subscriptions },
      { upsert: true }
    )
      .exec()
      .catch(_ => {
        throw new InternalServerErrorException('Error subscribing to channel');
      });

    this.subscriptionsQueue.add({
      userSubscriptions: [
        {
          subscriptions: [
            {
              channelId
            }
          ]
        }
      ],
      silent: true
    });

    return {
      channelId,
      isSubscribed: true
    };
  }

  async unsubscribeFromChannel(
    username: string,
    channelId: string
  ): Promise<SubscriptionStatusDto> {
    const user = await this.SubscriptionModel.findOne({ username }).exec();
    if (
      user &&
      user.subscriptions &&
      user.subscriptions.length > 0 &&
      user.subscriptions.find(e => e.channelId === channelId)
    ) {
      user.subscriptions = user.subscriptions.filter(e => e.channelId !== channelId);
      await user.save();

      return {
        channelId,
        isSubscribed: false
      };
    }
    throw new NotFoundException({
      message: 'User or subscription not found'
    });
  }
}
