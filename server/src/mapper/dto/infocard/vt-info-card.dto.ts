import { VTThumbnailDto } from '../vt-thumbnail.dto';
import { VTPlaylistCardContent } from './vt-playlist-card-content.dto';
import { VTSimpleCardContentDto } from './vt-simple-card-content.dto';
import { VTVideoCardContent } from './vt-video-card-content.dto';

export class VTInfoCardDto {
  shortName: string;
  startMs: number;
  endMs: number;
  thumbnails: Array<VTThumbnailDto>;
  content: VTSimpleCardContentDto | VTVideoCardContent | VTPlaylistCardContent;
}
