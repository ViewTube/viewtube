import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';

export class PopularDto {
  videos: Array<VideoBasicInfoDto>;
  updatedAt: Date;
}
