import { VTAuthorDto } from '../vt-author.dto';
import { VTThumbnailDto } from '../vt-thumbnail.dto';
import { VTVideoCoreDto } from '../vt-video-core.dto';

export class VTSearchPlaylistDto {
  type: 'playlist';
  id: string;
  title: string;
  thumbnails?: Array<VTThumbnailDto>;
  author?: VTAuthorDto;
  videoCount?: number;
  firstVideos?: Array<VTVideoCoreDto>;
}
