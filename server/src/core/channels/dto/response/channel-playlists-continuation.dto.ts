import type { ChannelInfoResponseContinuation, Playlist } from '../../yt-channel-info/app/types';
import type { ChannelPlaylistDto } from '../basic/channel-playlist.dto';

export class ChannelPlaylistsContinuationDto implements ChannelInfoResponseContinuation<Playlist> {
  items?: ChannelPlaylistDto[];
  continuation?: string;
}
