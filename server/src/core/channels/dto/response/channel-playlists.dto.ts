import { ChannelInfoResponse, Playlist } from '../../yt-channel-info/app/types';
import { ChannelPlaylistDto } from '../basic/channel-playlist.dto';

export class ChannelPlaylistsDto implements ChannelInfoResponse<Playlist> {
  channelIdType?: number;
  alertMessage?: string;
  items?: ChannelPlaylistDto[];
  continuation?: string;
}
