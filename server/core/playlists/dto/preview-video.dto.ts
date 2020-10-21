import { VideoThumbnailDto } from 'shared/dto/video/video-thumbnail.dto';

export class PreviewVideoDto {
  title?: string;
  videoId?: string;
  videoThumbnails: Array<VideoThumbnailDto>;
}
