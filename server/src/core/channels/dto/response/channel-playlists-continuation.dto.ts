import { ChannelInfoResponseContinuation, Playlist } from '../../yt-channel-info/app/types';
import { ChannelPlaylistDto } from '../basic/channel-playlist.dto';

export class ChannelPlaylistsContinuationDto implements ChannelInfoResponseContinuation<Playlist> {
  items?: ChannelPlaylistDto[];
  continuation?: string;
}
