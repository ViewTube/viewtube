import { VTAuthorDto } from './vt-author.dto';
import { VTThumbnailDto } from './vt-thumbnail.dto';
import { VTVideoCoreDto } from './vt-video-core.dto';

export class VTVideoDto extends VTVideoCoreDto {
  author?: VTAuthorDto;
  description?: string;
  thumbnails?: Array<VTThumbnailDto>;
  richThumbnails?: Array<VTThumbnailDto>;
  published?: {
    date?: Date;
    text?: string;
  };
  viewCount?: number;
  upcoming?: Date;
  live?: boolean;
}
