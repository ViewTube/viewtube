import { VideoThumbnailDto } from 'viewtube/shared/dto/video/video-thumbnail.dto';
import { PreviewVideoDto } from './preview-video.dto';

export class PlaylistBasicInfoDto {
  title: string;
  playlistId: string;
  playlistVideoLink: string;
  playlistLink: string;
  author: string;
  authorId: string;
  authorUrl?: string;
  videoCount: number;
  firstVideoId?: string;
  playlistThumbnails?: Array<VideoThumbnailDto>;
  previewVideos?: Array<PreviewVideoDto>;
}
