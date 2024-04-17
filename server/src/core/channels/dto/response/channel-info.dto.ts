import type { ChannelInfo } from '../../yt-channel-info/app/types';
import type { ChannelImageDto } from '../basic/channel-image.dto';
import type { ChannelLinkDto } from '../basic/channel-link.dto';
import type { RelatedChannelDto } from '../basic/related-channel.dto';

export class ChannelInfoDto implements Omit<ChannelInfo, 'relatedChannels'> {
  author: string;
  authorId: string;
  authorUrl: string;
  oResponse;
  authorBanners: ChannelImageDto[];
  authorThumbnails: ChannelImageDto[];
  subscriberText: string;
  subscriberCount: number;
  description: string;
  isFamilyFriendly: boolean;
  relatedChannels: { items: RelatedChannelDto[]; continuation: string | null };
  allowedRegions: string[];
  isVerified: boolean;
  isOfficialArtist: boolean;
  tags: string[];
  channelIdType: number;
  channelTabs: string[];
  alertMessage: string;
  channelLinks: { primaryLinks: ChannelLinkDto[]; secondaryLinks: ChannelLinkDto[] };
}
