import type { ChannelIdType, ChannelInfoResponse, Video } from '../../yt-channel-info/app/types';
import type { ChannelVideoDto } from '../basic/channel-video.dto';

export class ChannelVideosDto implements ChannelInfoResponse<Video> {
  channelIdType?: ChannelIdType;
  alertMessage?: string;
  items?: ChannelVideoDto[];
  continuation?: string;
}
