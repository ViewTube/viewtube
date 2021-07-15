import { OnQueueActive, OnQueueCompleted, Processor } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { Model } from 'mongoose';
import { General } from 'server/common/general.schema';
import { ChannelBasicInfo } from 'server/core/channels/schemas/channel-basic-info.schema';
import { VideoBasicInfo } from 'server/core/videos/schemas/video-basic-info.schema';

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

  @OnQueueCompleted()
  async onCompleted(job: Job, result: { channelsToUpdate: any; videosToUpdate: any }) {
    try {
      await this.ChannelBasicInfoModel.bulkWrite(result.channelsToUpdate);
      await this.VideoModel.bulkWrite(result.videosToUpdate);

      await this.GeneralModel.findOneAndUpdate(
        { version: 1 },
        { lastSubscriptionsRefresh: job.finishedOn },
        { upsert: true }
      ).exec();
    } catch (_) {}
    // this.sendUserNotifications(subscriptionResults.videoResultArray);

    console.log(
      `done and dusted in ${job.finishedOn}: ${result.channelsToUpdate.length} channels, ${result.videosToUpdate.length} videos`
    );
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
  }
}
