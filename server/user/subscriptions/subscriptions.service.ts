import fs from 'fs';
import path from 'path';
import {
  Injectable,
  HttpException,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { VideoBasicInfo } from 'server/core/videos/schemas/video-basic-info.schema';
import { ChannelBasicInfo } from 'server/core/channels/schemas/channel-basic-info.schema';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import X2js from 'x2js';
import fetch from 'node-fetch';
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
import { Common } from 'server/core/common';
import humanizeDuration from 'humanize-duration';
import { Sorting } from 'server/common/sorting.type';
import { ChannelBasicInfoDto } from 'server/core/channels/dto/channel-basic-info.dto';
import Consola from 'consola';
import { NotificationsService } from '../notifications/notifications.service';
import { Subscription } from './schemas/subscription.schema';
import { SubscriptionStatusDto } from './dto/subscription-status.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(VideoBasicInfo.name)
    private readonly VideoModel: Model<VideoBasicInfo>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<Subscription>,
    @InjectModel(ChannelBasicInfo.name)
    private readonly ChannelBasicInfoModel: Model<ChannelBasicInfo>,
    private notificationsService: NotificationsService
  ) {}

  private feedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=';

  @Cron(CronExpression.EVERY_30_MINUTES)
  async collectSubscriptionsJob(): Promise<void> {
    const timeMeasurementName = 'subscription-job ' + new Date().toISOString();
    console.time(timeMeasurementName);
    const users = await this.subscriptionModel.find().lean(true).exec();
    const channelIds = users.reduce(
      (val, { subscriptions }) => [...val, ...subscriptions.map(e => e.channelId)],
      []
    );
    const uniqueChannelIds = [...new Set(channelIds)];

    const feedRequests = uniqueChannelIds.map(async id => {
      const channelFeed = await this.getChannelFeed(id);
      if (channelFeed) {
        const { videos, channel } = channelFeed;
        this.saveChannelBasicInfo(channel);
        return videos;
      }
    });

    const promiseResults = await Promise.allSettled(feedRequests);
    if (promiseResults.find((promiseResult: any) => promiseResult.value)) {
      const videoValues = promiseResults.filter((promiseResult: any) => promiseResult.value);
      const videos: Array<VideoBasicInfoDto> = videoValues.reduce(
        (promiseResult: any, { value }: any) => [...promiseResult, ...value],
        []
      );

      await Promise.allSettled(
        videos.map(async element => {
          if (
            !(await this.VideoModel.exists({
              videoId: element.videoId
            }))
          ) {
            this.sendUserNotifications(element);
          }
          try {
            return this.saveVideoBasicInfo(element);
          } catch (err) {
            Consola.error('Error saving video info for id ' + element.videoId);
          }
        })
      );
      console.timeEnd(timeMeasurementName);
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
      .catch(_ => Consola.error('Error saving channel info for id ' + channel.authorId));
    return savedChannel || null;
  }

  async saveVideoBasicInfo(video: VideoBasicInfoDto): Promise<VideoBasicInfoDto | null> {
    const savedVideo = await this.VideoModel.findOneAndUpdate({ videoId: video.videoId }, video, {
      upsert: true
    }).exec();
    return savedVideo || null;
  }

  getChannelFeed(
    channelId: string
  ): Promise<void | {
    channel: ChannelBasicInfoDto;
    videos: Array<VideoBasicInfoDto>;
  }> {
    return fetch(this.feedUrl + channelId)
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        return null;
      })
      .then(data => {
        if (data) {
          const x2js = new X2js();
          const jsonData = x2js.xml2js(data) as any;
          if (jsonData.feed.entry) {
            let videos: Array<VideoBasicInfoDto> = [];
            // For channels that have no videos
            if (jsonData.feed.entry.length) {
              videos = jsonData.feed.entry.map((video: any) => this.convertRssVideo(video));
            }

            const authorId = jsonData.feed.channelId.toString();

            const channel: ChannelBasicInfoDto = {
              authorId,
              author: jsonData.feed.author.name,
              authorUrl: jsonData.feed.author.uri
            };

            const cachedChannelThmbPath = path.join(
              (global as any).__basedir,
              `channels/${authorId}.jpg`
            );
            if (fs.existsSync(cachedChannelThmbPath)) {
              channel.authorThumbnailUrl = `channels/${authorId}/thumbnail/tiny.jpg`;
            } else {
              channel.authorThumbnailUrl = undefined;
            }

            return { channel, videos };
          }
        } else {
          return null;
        }
      })
      .catch(err =>
        Consola.warn(`Could not find channel, the following error can be safely ignored:\n${err}`)
      );
  }

  async sendUserNotifications(video: VideoBasicInfoDto): Promise<void> {
    const users = await this.subscriptionModel.find().lean().exec();
    const subscribedUsers = users.filter(u =>
      u.subscriptions.find(sub => sub.channelId === video.authorId)
    );
    if (subscribedUsers) {
      subscribedUsers.forEach((user: Subscription) => {
        const channelSubscription = user.subscriptions.find(e => e.channelId === video.authorId);
        if (
          channelSubscription.createdAt &&
          channelSubscription.createdAt.valueOf() < video.published
        ) {
          this.notificationsService.sendVideoNotification(user.username, video);
        }
      });
    }
  }

  convertRssVideo(video: any): VideoBasicInfoDto {
    const rating = video.group.community.starRating;
    const { likes, dislikes } = this.convertStarsToLikesDislikes({
      totalRatings: rating._count,
      avgStarRatings: rating._average
    });

    const durationString = humanizeDuration(
      new Date().valueOf() - Date.parse(video.published).valueOf(),
      { largest: 1 }
    );

    const description = video.group.description.toString();
    const descriptionText = typeof description === 'string' ? description : '';

    return {
      videoId: video.videoId.toString(),
      title: video.title,
      author: video.author.name,
      authorId: video.channelId.toString(),
      description: descriptionText,
      published: Date.parse(video.published),
      publishedText: durationString,
      videoThumbnails: Common.getVideoThumbnails(video.videoId.toString()),
      viewCount: video.group.community.statistics._views,
      likeCount: likes,
      dislikeCount: dislikes
    };
  }

  convertStarsToLikesDislikes({
    totalRatings,
    avgStarRatings
  }: {
    totalRatings: number;
    avgStarRatings: number;
  }): { likes: number; dislikes: number } {
    const likeRatio = (avgStarRatings - 1) / 4;
    const likes = Math.round(totalRatings * likeRatio);
    const dislikes = Math.round(totalRatings * (1 - likeRatio));
    return { likes, dislikes };
  }

  async getSubscribedChannelsCount(username: string): Promise<number> {
    const user = await this.subscriptionModel
      .findOne({ username })
      .exec()
      .catch(_ => {});

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
  ): Promise<{ channels: Array<ChannelBasicInfoDto>; channelCount: number }> {
    const user = await this.subscriptionModel
      .findOne({ username })
      .exec()
      .catch(_ => {});
    if (user) {
      const userChannelIds = user.subscriptions.map(e => e.channelId);
      if (userChannelIds) {
        const channelCount = await this.ChannelBasicInfoModel.countDocuments({
          authorId: { $in: userChannelIds },
          author: { $regex: `.*${filter}.*`, $options: 'i' }
        });
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
  ): Promise<{ videoCount: number; videos: Array<VideoBasicInfoDto> }> {
    const userSubscriptions = await this.subscriptionModel.findOne({ username }).lean().exec();
    if (userSubscriptions) {
      const userSubscriptionIds = userSubscriptions.subscriptions.map(e => e.channelId);
      const videoCount = await this.VideoModel.countDocuments({
        authorId: { $in: userSubscriptionIds }
      });
      const videos = await this.VideoModel.find({ authorId: { $in: userSubscriptionIds } })
        .sort({ published: -1 })
        .limit(parseInt(limit as any))
        .skip(parseInt(start as any))
        .map((el: any) => {
          delete el._id;
          delete el.__v;
          return el;
        })
        .catch(err => {
          throw new HttpException(`Error fetching subscription feed: ${err}`, 500);
        });
      if (videos) {
        const channelIds = videos.map((video: VideoBasicInfoDto) => video.authorId);

        const channelBasicInfoArray = await this.ChannelBasicInfoModel.find({
          authorId: { $in: channelIds }
        }).exec();

        videos.forEach((video: VideoBasicInfoDto) => {
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
        return { videos, videoCount };
      }
    }
    return { videos: [], videoCount: 0 };
  }

  async getSubscription(username: string, channelId: string): Promise<SubscriptionStatusDto> {
    const user = await this.subscriptionModel.findOne({ username }).exec();
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
    channelIds: Array<string>
  ): Promise<{
    successful: Array<SubscriptionStatusDto>;
    failed: Array<SubscriptionStatusDto>;
    existing: Array<SubscriptionStatusDto>;
  }> {
    const successful: Array<SubscriptionStatusDto> = [];
    const failed: Array<SubscriptionStatusDto> = [];
    const existing: Array<SubscriptionStatusDto> = [];
    const user = await this.subscriptionModel.findOne({ username }).exec();
    const subscriptions = user !== null ? user.subscriptions : [];

    await Promise.allSettled(
      channelIds
        .filter(channelId => {
          if (subscriptions.find(e => e.channelId === channelId)) {
            existing.push({ channelId, isSubscribed: true });
            return false;
          }
          return true;
        })
        .map(async (id: string) => {
          const channelFeed = await this.getChannelFeed(id);
          if (channelFeed) {
            let channel: ChannelBasicInfoDto;
            try {
              channel = await this.saveChannelBasicInfo(channelFeed.channel);
              await Promise.all(
                channelFeed.videos.map(vid => {
                  return this.saveVideoBasicInfo(vid);
                })
              );
            } catch (err) {
              failed.push({
                channelId: id,
                isSubscribed: false
              });
            }
            if (channel) {
              if (!subscriptions.find(e => e.channelId === channel.authorId)) {
                subscriptions.push({
                  channelId: channel.authorId,
                  createdAt: new Date()
                });

                successful.push({
                  channelId: channel.authorId,
                  isSubscribed: true
                });
              } else {
                existing.push({
                  channelId: channel.authorId,
                  isSubscribed: true
                });
              }
            }
          } else {
            failed.push({
              channelId: id,
              isSubscribed: false
            });
          }
        })
    ).then(() => {
      return this.subscriptionModel
        .findOneAndUpdate({ username }, { username, subscriptions }, { upsert: true })
        .exec()
        .catch(_ => {
          throw new InternalServerErrorException('Error updating subscriptions');
        });
    });
    return { successful, failed, existing };
  }

  /**
   *
   * @param {string} username
   * @param {string} channelId
   *
   * @returns {SubscriptionStatusDto} The subscription status
   */
  async subscribeToChannel(username: string, channelId: string): Promise<SubscriptionStatusDto> {
    const user = await this.subscriptionModel.findOne({ username }).exec();

    const channelFeed = await this.getChannelFeed(channelId);
    if (channelFeed) {
      let channel: ChannelBasicInfoDto;

      try {
        channel = await this.saveChannelBasicInfo(channelFeed.channel);
        await Promise.all(
          channelFeed.videos.map(vid => {
            return this.saveVideoBasicInfo(vid);
          })
        );
      } catch (_) {}
      const subscriptions = user ? user.subscriptions : [];

      const currentSubscription = subscriptions.find(e => e.channelId === channel.authorId);

      if (!currentSubscription) {
        subscriptions.push({
          channelId: channel.authorId,
          createdAt: new Date()
        });
      }

      await this.subscriptionModel
        .findOneAndUpdate({ username }, { username, subscriptions }, { upsert: true })
        .exec()
        .then()
        .catch(_ => {
          throw new InternalServerErrorException('Error subscribing to channel');
        });

      return {
        channelId,
        isSubscribed: true
      };
    }
  }

  async unsubscribeFromChannel(
    username: string,
    channelId: string
  ): Promise<SubscriptionStatusDto> {
    const user = await this.subscriptionModel.findOne({ username }).exec();
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
      message: 'User or subscription not found',
      ignoreFilter: true
    });
  }
}
