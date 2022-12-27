import { ChannelPlaylistInfoResponse } from '../../types/ytch.types';
import { ChannelPlaylistDto } from '../basic/channel-playlist.dto';

export class ChannelPlaylistsDto implements ChannelPlaylistInfoResponse {
  channelIdType: number;
  alertMessage?: string;
  items: ChannelPlaylistDto[];
  continuation: string;
}
