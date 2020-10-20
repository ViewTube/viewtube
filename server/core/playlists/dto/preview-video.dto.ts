import { VideoThumbnailDto } from 'server/core/videos/dto/video-thumbnail.dto';

export class PreviewVideoDto {
  title?: string;
  videoId?: string;
  videoThumbnails: Array<VideoThumbnailDto>;
}
