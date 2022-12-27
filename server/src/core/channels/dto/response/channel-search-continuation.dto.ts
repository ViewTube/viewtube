import { ChannelSearchContinuationResponse } from '../../types/ytch.types';
import { ChannelVideoDto } from '../basic/channel-video.dto';

export class ChannelSearchContinuationDto implements ChannelSearchContinuationResponse {
  items: ChannelVideoDto[];
  continuation: string;
}
