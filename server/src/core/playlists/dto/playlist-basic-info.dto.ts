import type { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';
import type { PreviewVideoDto } from './preview-video.dto';

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
  playlistThumbnails?: Array<VTThumbnailDto>;
  previewVideos?: Array<PreviewVideoDto>;
}
