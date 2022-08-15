import { VideoThumbnailDto } from 'viewtube/shared/dto/video/video-thumbnail.dto';

export class PreviewVideoDto {
  title?: string;
  videoId?: string;
  videoThumbnails: Array<VideoThumbnailDto>;
}
