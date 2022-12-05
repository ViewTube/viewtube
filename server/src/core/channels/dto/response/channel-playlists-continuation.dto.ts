import { ChannelPlaylistContinuationResponse } from '../../types/ytch.types';
import { ChannelPlaylistDto } from '../basic/channel-playlist.dto';

export class ChannelPlaylistsContinuationDto implements ChannelPlaylistContinuationResponse {
  items: ChannelPlaylistDto[];
  continuation: string;
}
