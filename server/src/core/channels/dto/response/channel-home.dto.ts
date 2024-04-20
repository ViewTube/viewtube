import { ChannelHomeResponse } from '../../yt-channel-info/app/types';
import { ChannelVideoDto } from '../basic/channel-video.dto';
import { ChannelHomeItemDto } from './channel-home-item.dto';

export class ChannelHomeDto implements ChannelHomeResponse {
  featuredVideo: ChannelVideoDto;
  items: Array<ChannelHomeItemDto>;
}
