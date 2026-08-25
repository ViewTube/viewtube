import { VTAuthorDto } from './vt-author.dto';
import { VTThumbnailDto } from './vt-thumbnail.dto';

export class VTPlaylistDto {
  type: 'playlist';
  id: string;
  title: string;
  thumbnails?: Array<VTThumbnailDto>;
  author?: VTAuthorDto;
  videoCount?: number;
}
