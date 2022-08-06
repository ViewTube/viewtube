import { VideoBasicInfoDto } from 'viewtube/shared/dto/video/video-basic-info.dto';

export class PopularDto {
  videos: Array<VideoBasicInfoDto>;
  updatedAt: Date;
}
