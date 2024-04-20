import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';

export class SubscriptionFeedResponseDto {
  videoCount: number;
  videos: Array<VideoBasicInfoDto>;
  lastRefresh: Date;
}
