import { ChannelIdType, ChannelVideosResponse } from '../../types/ytch.types';
import { ChannelVideoDto } from '../basic/channel-video.dto';

export class ChannelVideosDto implements ChannelVideosResponse {
  channelIdType: ChannelIdType;
  alertMessage?: string;
  items: ChannelVideoDto[];
  continuation: string;
}
