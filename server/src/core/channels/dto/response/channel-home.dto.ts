import type { ChannelHomeResponse } from '../../yt-channel-info/app/types';
import type { ChannelVideoDto } from '../basic/channel-video.dto';
import type { ChannelHomeItemDto } from './channel-home-item.dto';

export class ChannelHomeDto implements ChannelHomeResponse {
  featuredVideo: ChannelVideoDto;
  items: Array<ChannelHomeItemDto>;
}
