import { VTChannelAboutDto } from 'server/mapper/dto/channel/vt-channel-about.dto';
import { VTChannelPageDto } from 'server/mapper/dto/channel/vt-channel-page.dto';
import { parseShortenedNumber } from 'server/mapper/utils/shortened-number';
import {
  AboutChannelApproximation,
  ChannelPageApproximation
} from './channel-page-source-approximation';
import {
  extractChannelArtist,
  extractChannelBanners,
  extractChannelHandle,
  extractChannelId,
  extractChannelJoinedDate,
  extractChannelLinks,
  extractChannelName,
  extractChannelSubscribers,
  extractChannelSubscriberText,
  extractChannelThumbnails,
  extractChannelVerified,
  extractChannelVideoCount,
  extractChannelViewCount
} from './vt-channel-page.extractors';

export const toVTChannelPageDto = (
  channel: ChannelPageApproximation,
  about?: AboutChannelApproximation
): VTChannelPageDto => {
  // The header only carries a shortened count ("7.8K videos"), the about tab has the exact one
  const videoCount = about?.video_count
    ? parseShortenedNumber(about.video_count)
    : extractChannelVideoCount(channel);

  return {
    id: extractChannelId(channel),
    name: extractChannelName(channel),
    handle: extractChannelHandle(channel),
    description: about?.description ?? channel?.metadata?.description,
    thumbnails: extractChannelThumbnails(channel),
    banners: extractChannelBanners(channel),
    subscribers: extractChannelSubscribers(channel),
    subscriberText: extractChannelSubscriberText(channel),
    videoCount,
    isVerified: extractChannelVerified(channel),
    isArtist: extractChannelArtist(channel),
    isFamilyFriendly: channel?.metadata?.is_family_safe,
    tags: channel?.metadata?.tags,
    allowedRegions: channel?.metadata?.available_countries,
    links: extractChannelLinks(about),
    tabs: channel?.tabs
  };
};

export const toVTChannelAboutDto = (about: AboutChannelApproximation): VTChannelAboutDto => {
  return {
    description: about?.description,
    joinedDate: extractChannelJoinedDate(about),
    viewCount: extractChannelViewCount(about),
    location: about?.country,
    subscribers: about?.subscriber_count ? parseShortenedNumber(about.subscriber_count) : undefined,
    videoCount: about?.video_count ? parseShortenedNumber(about.video_count) : undefined,
    links: extractChannelLinks(about)
  };
};
