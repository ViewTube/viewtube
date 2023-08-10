import { ChannelIdType, ChannelInfoResponse, Video } from '../../yt-channel-info/app/types';
import { ChannelVideoDto } from '../basic/channel-video.dto';

export class ChannelVideosDto implements ChannelInfoResponse<Video> {
  channelIdType?: ChannelIdType;
  alertMessage?: string;
  items?: ChannelVideoDto[];
  continuation?: string;
}
