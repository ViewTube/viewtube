import { VTChannelLinkDto } from 'server/mapper/dto/channel/vt-channel-link.dto';
import { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';
import { fixUrl } from 'server/mapper/utils/fix-url';
import { getHandleFromUrl } from 'server/mapper/utils/handle';
import { parseRedirectUrl } from 'server/mapper/utils/parse-redirect';
import { parseShortenedNumber } from 'server/mapper/utils/shortened-number';
import {
  AboutChannelApproximation,
  ChannelLinkApproximation,
  ChannelPageApproximation,
  PageHeaderApproximation
} from './channel-page-source-approximation';

const VERIFIED_ICON = 'CHECK_CIRCLE_FILLED';
const ARTIST_ICON = 'AUDIO_BADGE';

const handleRegex = /^@/;
const subscriberRegex = /subscribers?/i;
const videoCountRegex = /\bvideos?\b/i;

const mapThumbnails = (thumbnails: Array<Pick<VTThumbnailDto, 'url' | 'width' | 'height'>>) => {
  return thumbnails?.map(thumbnail => ({
    url: fixUrl(thumbnail.url),
    width: thumbnail.width,
    height: thumbnail.height
  }));
};

/**
 * Topic channels still serve the old `carouselHeaderRenderer`, which youtubei.js leaves unparsed,
 * so the header is missing entirely rather than merely incomplete.
 */
const extractHeaderContent = (header: PageHeaderApproximation) => {
  return header?.content;
};

const extractTitleIcons = (header: PageHeaderApproximation): Array<string> => {
  return (extractHeaderContent(header)?.title?.text?.runs ?? [])
    .map(
      run =>
        run?.attachment?.element?.type?.imageType?.image?.sources?.[0]?.clientResource?.imageName
    )
    .filter(Boolean);
};

const extractHeaderMetadataParts = (header: PageHeaderApproximation): Array<string> => {
  return (extractHeaderContent(header)?.metadata?.metadata_rows ?? [])
    .flatMap(row => row?.metadata_parts ?? [])
    .map(part => part?.text?.text)
    .filter(Boolean);
};

export const extractChannelName = (channel: ChannelPageApproximation): string => {
  return channel?.metadata?.title ?? extractHeaderContent(channel?.header)?.title?.text?.text;
};

export const extractChannelId = (channel: ChannelPageApproximation): string => {
  return channel?.metadata?.external_id;
};

export const extractChannelHandle = (channel: ChannelPageApproximation): string => {
  const handlePart = extractHeaderMetadataParts(channel?.header).find(part =>
    handleRegex.test(part)
  );

  return handlePart ?? getHandleFromUrl(channel?.metadata?.vanity_channel_url);
};

export const extractChannelThumbnails = (
  channel: ChannelPageApproximation
): Array<VTThumbnailDto> => {
  const avatar = extractHeaderContent(channel?.header)?.image?.avatar?.image;

  return mapThumbnails(avatar ?? channel?.metadata?.avatar);
};

export const extractChannelBanners = (channel: ChannelPageApproximation): Array<VTThumbnailDto> => {
  return mapThumbnails(extractHeaderContent(channel?.header)?.banner?.image);
};

/**
 * The header states the subscriber count as shortened text only, e.g. "16.9M subscribers". Artist
 * and topic channels omit it, so this is absent rather than zero for them.
 */
export const extractChannelSubscriberText = (channel: ChannelPageApproximation): string => {
  return extractHeaderMetadataParts(channel?.header).find(part => subscriberRegex.test(part));
};

export const extractChannelSubscribers = (channel: ChannelPageApproximation): number => {
  const subscriberText = extractChannelSubscriberText(channel);
  if (!subscriberText) return undefined;

  return parseShortenedNumber(subscriberText);
};

export const extractChannelVideoCount = (channel: ChannelPageApproximation): number => {
  const videoCountText = extractHeaderMetadataParts(channel?.header).find(
    part => videoCountRegex.test(part) && !subscriberRegex.test(part)
  );
  if (!videoCountText) return undefined;

  return parseShortenedNumber(videoCountText);
};

export const extractChannelVerified = (channel: ChannelPageApproximation): boolean => {
  return extractTitleIcons(channel?.header).includes(VERIFIED_ICON);
};

export const extractChannelArtist = (channel: ChannelPageApproximation): boolean => {
  return extractTitleIcons(channel?.header).includes(ARTIST_ICON);
};

/**
 * YouTube offers ten sizes of every favicon, from 16 to 256, which is several kilobytes of URLs
 * per channel for an icon rendered at 24px. Keep the smallest and one big enough for a 2x display.
 */
const pickFavicons = (favicons: ChannelLinkApproximation['favicon']): Array<VTThumbnailDto> => {
  const mapped = mapThumbnails(favicons);
  if (!mapped?.length) return undefined;

  const ascending = [...mapped].sort((first, second) => first.width - second.width);
  const smallest = ascending[0];
  const retina = ascending.find(favicon => favicon.width >= 48) ?? ascending[ascending.length - 1];

  return smallest === retina ? [smallest] : [smallest, retina];
};

export const extractChannelLinks = (about: AboutChannelApproximation): Array<VTChannelLinkDto> => {
  return (about?.links ?? [])
    .map((link: ChannelLinkApproximation) => {
      const redirectUrl = link?.link?.endpoint?.payload?.url;

      return {
        title: link?.title?.text ?? link?.link?.text,
        // YouTube wraps every channel link in a redirect, the real target sits in its `q` param
        url: parseRedirectUrl(redirectUrl) ?? redirectUrl,
        favicons: pickFavicons(link?.favicon)
      };
    })
    .filter(link => link.url);
};

export const extractChannelJoinedDate = (about: AboutChannelApproximation): number => {
  const joinedText = about?.joined_date?.text;
  if (!joinedText) return undefined;

  // "Joined Nov 25, 2008" — Date.parse only accepts the date itself
  const parsed = Date.parse(joinedText.replace(/^joined\s+/i, ''));

  return Number.isNaN(parsed) ? undefined : parsed;
};

export const extractChannelViewCount = (about: AboutChannelApproximation): number => {
  const viewCountText = about?.view_count;
  if (!viewCountText) return undefined;

  return parseShortenedNumber(viewCountText);
};
