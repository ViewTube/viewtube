import { VTPlaylistDto } from '../vt-playlist.dto';
import { VTVideoDto } from '../vt-video.dto';

export class VTChannelSearchDto {
  videos: Array<VTVideoDto>;
  playlists?: Array<VTPlaylistDto>;
  continuation?: string;
}
