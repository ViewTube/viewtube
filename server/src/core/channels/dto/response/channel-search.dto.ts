import { ChannelSearchResponse } from '../../types/ytch.types';
import { ChannelVideoDto } from '../basic/channel-video.dto';

export class ChannelSearchDto implements ChannelSearchResponse {
  items: ChannelVideoDto[];
  continuation: string;
}
