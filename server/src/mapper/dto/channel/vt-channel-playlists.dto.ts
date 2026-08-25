import { VTPlaylistDto } from '../vt-playlist.dto';

export class VTChannelPlaylistsDto {
  playlists: Array<VTPlaylistDto>;
  continuation?: string;
}
