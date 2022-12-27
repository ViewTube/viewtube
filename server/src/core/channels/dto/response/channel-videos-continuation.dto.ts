import { ChannelVideosContinuationResponse } from '../../types/ytch.types';
import { ChannelVideoDto } from '../basic/channel-video.dto';

export class ChannelVideosContinuationDto implements ChannelVideosContinuationResponse {
  items: ChannelVideoDto[];
  continuation: string;
}
