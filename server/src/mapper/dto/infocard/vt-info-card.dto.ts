import type { VTPlaylistCardContentDto } from './vt-playlist-card-content.dto';
import type { VTSimpleCardContentDto } from './vt-simple-card-content.dto';
import type { VTVideoCardContentDto } from './vt-video-card-content.dto';

export class VTInfoCardDto {
  shortName: string;
  startMs: number;
  endMs: number;
  content: VTSimpleCardContentDto | VTVideoCardContentDto | VTPlaylistCardContentDto;
}
