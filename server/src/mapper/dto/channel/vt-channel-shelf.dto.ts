import { VTChannelDto } from '../vt-channel.dto';
import { VTPlaylistDto } from '../vt-playlist.dto';
import { VTVideoDto } from '../vt-video.dto';

/**
 * A union of item types would be generated as `Record<string, never>[]` by the swagger plugin,
 * leaving the client untyped. One typed array per kind, picked by `type`, keeps the contract usable.
 */
export class VTChannelShelfDto {
  title: string;
  type: 'videos' | 'shorts' | 'playlists' | 'channels';
  videos?: Array<VTVideoDto>;
  playlists?: Array<VTPlaylistDto>;
  channels?: Array<VTChannelDto>;
}
