import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueProgress,
  Process,
  Processor
} from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { Model } from 'mongoose';
import { General } from 'server/common/general.schema';
import { ChannelBasicInfo } from 'server/core/channels/schemas/channel-basic-info.schema';
import { VideoBasicInfo } from 'server/core/videos/schemas/video-basic-info.schema';
import { runSubscriptionsJob } from './subscriptions-job.helper';
import { Logger } from '@nestjs/common';
import { ChannelBasicInfoDto } from 'server/core/channels/dto/channel-basic-info.dto';
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';

export interface SubscriptionsQueueParams {
  userSubscriptions: Array<{
    subscriptions: Array<{
      channelId: string;
    }>;
  }>;
  silent?: boolean;
}

@Processor('subscriptions')
export class SubscriptionsProcessor {
  constructor(
    @InjectModel(VideoBasicInfo.name)
    private readonly VideoModel: Model<VideoBasicInfo>,
    @InjectModel(ChannelBasicInfo.name)
    private readonly ChannelBasicInfoModel: Model<ChannelBasicInfo>,
    @InjectModel(General.name)
    private readonly GeneralModel: Model<General>,
    private readonly logger: Logger
  ) {}

  @Process()
  async subscriptionsJob(job: Job<SubscriptionsQueueParams>) {
    const channelIds = job.data.userSubscriptions.reduce(
      (val, { subscriptions }) => [...val, ...subscriptions.map(e => e.channelId)],
      []
    );
    const uniqueChannelIds = [...new Set<string>(channelIds)];
    let subscriptionResults: {
      channelResultArray: ChannelBasicInfoDto[];
      videoResultArray: VideoBasicInfoDto[];
    } = null;
    try {
      subscriptionResults = await runSubscriptionsJob(uniqueChannelIds, job);
    } catch (error) {
      throw new Error(error);
    }

    if (subscriptionResults) {
      const channelsToUpdate = subscriptionResults.channelResultArray.map(channel => {
        return {
          updateOne: {
            filter: { authorId: channel.authorId },
            update: { $set: channel },
            upsert: true
          }
        };
      });

      const videosToUpdate = subscriptionResults.videoResultArray.map(video => {
        return {
          updateOne: {
            filter: { videoId: video.videoId },
            update: { $set: video },
            upsert: true
          }
        };
      });

      return {
        channelsToUpdate,
        videosToUpdate
      };
    }
    return null;
  }

  @OnQueueProgress()
  onProgress(job: Job<SubscriptionsQueueParams>, progress: number) {
    if (!job.data.silent) {
      this.logger.log(`Subscriptions job: ${progress}% done`);
    }
  }

  @OnQueueError()
  onError(error: Error) {
    this.logger.log(error);
  }

  @OnQueueCompleted()
  async onCompleted(
    job: Job<SubscriptionsQueueParams>,
    result: { channelsToUpdate: any; videosToUpdate: any }
  ) {
    if (result) {
      try {
        await this.ChannelBasicInfoModel.bulkWrite(result.channelsToUpdate);
        await this.VideoModel.bulkWrite(result.videosToUpdate);

        await this.GeneralModel.findOneAndUpdate(
          { version: 1 },
          { lastSubscriptionsRefresh: job.finishedOn },
          { upsert: true }
        ).exec();
      } catch (error) {
        this.logger.log('error running job');
        this.logger.log(error);
      }
      // this.sendUserNotifications(subscriptionResults.videoResultArray);

      if (!job.data.silent) {
        this.logger.log(
          `Done at ${new Date(job.finishedOn).toISOString().replace('T', ' ')}: ${
            result.channelsToUpdate.length
          } channels, ${result.videosToUpdate.length} videos`
        );
      }
    } else {
      if (!job.data.silent) {
        this.logger.log('subscriptions job failed');
      }
    }
  }

  @OnQueueActive()
  onActive(job: Job<SubscriptionsQueueParams>) {
    if (!job.data.silent) {
      this.logger.log(
        `Starting subscriptions job ${job.id} at ${new Date().toISOString().replace('T', ' ')}`
      );
    }
  }
}
