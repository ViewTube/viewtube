import { RelatedChannel } from '../../types/ytch.types';
import { ChannelImageDto } from './channel-image.dto';

export class RelatedChannelDto implements RelatedChannel {
  channelName: string;
  channelId: string;
  channelUrl: string;
  thumbnail: ChannelImageDto[];
  videoCount: number;
  subscriberText: string;
  subscriberCount: number;
  verified: boolean;
  officialArist: boolean;
}
