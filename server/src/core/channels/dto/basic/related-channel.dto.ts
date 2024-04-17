import type { Image, RelatedChannel } from '../../yt-channel-info/app/types';

export class RelatedChannelDto implements RelatedChannel {
  channelName?: string;
  channelId?: string;
  channelUrl?: string;
  author: string;
  authorId: string;
  authorUrl: string;
  authorThumbnails: Image[];
  videoCount: number;
  subscriberText: string;
  subscriberCount: number;
  verified: boolean;
  officialArtist: boolean;
  officialArist: boolean;
}
