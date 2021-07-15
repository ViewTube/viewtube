import { OnQueueActive, OnQueueCompleted, OnQueueError, Process, Processor } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { Model } from 'mongoose';
import { General } from 'server/common/general.schema';
import { ChannelBasicInfo } from 'server/core/channels/schemas/channel-basic-info.schema';
import { VideoBasicInfo } from 'server/core/videos/schemas/video-basic-info.schema';
import { Subscription } from './schemas/subscription.schema';
import { runSubscriptionsJob } from './subscriptions-job.helper';

@Processor('subscriptions')
export class SubscriptionsProcessor {
  constructor(
    @InjectModel(VideoBasicInfo.name)
    private readonly VideoModel: Model<VideoBasicInfo>,
    @InjectModel(ChannelBasicInfo.name)
    private readonly ChannelBasicInfoModel: Model<ChannelBasicInfo>,
    @InjectModel(General.name)
    private readonly GeneralModel: Model<General>
  ) {}

  @Process()
  async subscriptionsJob(job: Job<{ userSubscriptions: Array<Subscription> }>) {
    const channelIds = job.data.userSubscriptions.reduce(
      (val, { subscriptions }) => [...val, ...subscriptions.map(e => e.channelId)],
      []
    );
    const uniqueChannelIds = [...new Set(channelIds)];
    let subscriptionResults = null;
    try {
      subscriptionResults = await runSubscriptionsJob(uniqueChannelIds);
    } catch (error) {
      console.log(error);
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

  @OnQueueError()
  onError(error: Error) {
    console.log(error);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job, result: { channelsToUpdate: any; videosToUpdate: any }) {
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
        console.log('error running job');
        console.log(error);
      }
      // this.sendUserNotifications(subscriptionResults.videoResultArray);

      console.log(
        `done and dusted in ${job.finishedOn}: ${result.channelsToUpdate.length} channels, ${result.videosToUpdate.length} videos`
      );
    } else {
      console.log('subscriptions job failed');
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
  }
}
