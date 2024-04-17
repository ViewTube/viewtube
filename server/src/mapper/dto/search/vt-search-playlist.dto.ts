import type { VTAuthorDto } from '../vt-author.dto';
import type { VTThumbnailDto } from '../vt-thumbnail.dto';
import type { VTVideoCoreDto } from '../vt-video-core.dto';

export class VTSearchPlaylistDto {
  type: 'playlist';
  id: string;
  title: string;
  thumbnails?: Array<VTThumbnailDto>;
  author?: VTAuthorDto;
  videoCount?: number;
  firstVideos?: Array<VTVideoCoreDto>;
}
