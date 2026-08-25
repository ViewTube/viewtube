import { getSecondsFromTimestamp } from '@viewtube/shared';
import { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';
import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import { fixUrl } from 'server/mapper/utils/fix-url';
import { getHandleFromUrl } from 'server/mapper/utils/handle';
import { parseRelativeTime } from 'server/mapper/utils/parse-relative-time';
import { parseShortenedNumber } from 'server/mapper/utils/shortened-number';
import {
  LockupBadgeApproximation,
  LockupViewApproximation,
  ShortsLockupViewApproximation
} from './lockup-source-approximation';

const durationRegex = /^\d{1,3}(:\d{2}){1,2}$/;
const viewCountRegex = /\b(views?|watching|waiting)\b/i;
// Watch next lockups shorten the view count to a bare number, e.g. "4.6K"
const shortenedNumberRegex = /^\d[\d.,]*[kmb]?$/i;
const publishedRegex = /\bago\b|^(streamed|premiered|scheduled|live)/i;
const videoCountRegex = /\bvideos?\b/i;
const MEMBERS_ONLY_BADGE = 'BADGE_MEMBERS_ONLY';

export const extractLockupId = (lockup: LockupViewApproximation): string => {
  return lockup?.content_id || lockup?.renderer_context?.command_context?.on_tap?.payload?.videoId;
};

export const extractLockupTitle = (lockup: LockupViewApproximation): string => {
  return lockup?.metadata?.title?.text;
};

const extractLockupMetadataParts = (lockup: LockupViewApproximation): Array<string> => {
  return (lockup?.metadata?.metadata?.metadata_rows ?? [])
    .flatMap(row => row?.metadata_parts ?? [])
    .map(part => part?.text?.text)
    .filter(text => text);
};

/**
 * Metadata rows are not positionally stable: watch next lockups spread author, views and
 * publish date over two rows, while channel tab lockups use a single row without an author.
 * Classify the parts by their content instead of by their position.
 */
const classifyLockupMetadata = (lockup: LockupViewApproximation) => {
  const parts = extractLockupMetadataParts(lockup);

  const publishedText = parts.find(part => publishedRegex.test(part));
  const viewCountText = parts.find(
    part => part !== publishedText && (viewCountRegex.test(part) || shortenedNumberRegex.test(part))
  );
  const authorName = parts.find(part => part !== viewCountText && part !== publishedText);

  return { viewCountText, publishedText, authorName };
};

/**
 * Video lockups keep their overlays on the thumbnail itself, playlist lockups keep them on the
 * primary thumbnail of a collection. Read both so badges are found either way.
 */
const extractLockupOverlays = (lockup: LockupViewApproximation) => {
  return [
    ...(lockup?.content_image?.overlays ?? []),
    ...(lockup?.content_image?.primary_thumbnail?.overlays ?? [])
  ];
};

const extractLockupBadges = (lockup: LockupViewApproximation): Array<LockupBadgeApproximation> => {
  return extractLockupOverlays(lockup).flatMap(overlay => overlay?.badges ?? []);
};

export const extractLockupAuthor = (lockup: LockupViewApproximation): VTVideoDto['author'] => {
  const image = lockup?.metadata?.image;
  const endpoint = image?.renderer_context?.command_context?.on_tap?.payload;
  const id = endpoint?.browseId;
  const { authorName: name } = classifyLockupMetadata(lockup);

  if (!id || !name) return undefined;

  const thumbnails = (image?.avatar?.image ?? image?.avatars?.[0]?.image)?.map(thumbnail => ({
    url: thumbnail.url,
    width: thumbnail.width,
    height: thumbnail.height
  })) as Array<VTThumbnailDto>;

  return {
    id,
    name,
    thumbnails,
    handle: endpoint?.canonicalBaseUrl ? getHandleFromUrl(endpoint.canonicalBaseUrl) : undefined
  };
};

export const extractLockupDuration = (lockup: LockupViewApproximation): VTVideoDto['duration'] => {
  const durationText = extractLockupBadges(lockup).find(badge =>
    durationRegex.test(badge?.text ?? '')
  )?.text;

  if (!durationText) return undefined;

  return {
    text: durationText,
    seconds: getSecondsFromTimestamp(durationText)
  };
};

export const extractLockupPublished = (
  lockup: LockupViewApproximation
): VTVideoDto['published'] => {
  const { publishedText } = classifyLockupMetadata(lockup);
  if (!publishedText) return undefined;

  return {
    text: publishedText,
    date: parseRelativeTime(publishedText)?.toDate()
  };
};

export const extractLockupViewCount = (lockup: LockupViewApproximation): number => {
  const { viewCountText } = classifyLockupMetadata(lockup);
  if (!viewCountText) return undefined;

  return parseShortenedNumber(viewCountText);
};

export const extractLockupRichThumbnails = (
  lockup: LockupViewApproximation
): Array<VTThumbnailDto> => {
  const animatedThumbnails = extractLockupOverlays(lockup).find(
    overlay => overlay?.type === 'AnimatedThumbnailOverlayView'
  )?.thumbnail;

  return animatedThumbnails?.map(thumbnail => ({
    url: thumbnail.url,
    width: thumbnail.width,
    height: thumbnail.height
  }));
};

export const extractLockupLive = (lockup: LockupViewApproximation): boolean => {
  return extractLockupBadges(lockup).some(
    badge =>
      badge?.text?.toUpperCase() === 'LIVE' ||
      badge?.icon_name === 'LIVE' ||
      badge?.badge_style?.includes('LIVE')
  );
};

/**
 * Members-only entries are marked on the metadata row rather than the thumbnail. YouTube omits
 * their view count, and they are unplayable without a membership, so callers need to know.
 */
export const extractLockupMembersOnly = (lockup: LockupViewApproximation): boolean => {
  return (lockup?.metadata?.metadata?.metadata_rows ?? [])
    .flatMap(row => row?.badges ?? [])
    .some(badge => badge?.style === MEMBERS_ONLY_BADGE);
};

/**
 * Playlist lockups carry no id-derivable thumbnail like videos do, so the image has to be read
 * off the lockup itself.
 */
export const extractLockupThumbnails = (lockup: LockupViewApproximation): Array<VTThumbnailDto> => {
  const image = lockup?.content_image?.image ?? lockup?.content_image?.primary_thumbnail?.image;

  return image?.map(thumbnail => ({
    url: fixUrl(thumbnail.url),
    width: thumbnail.width,
    height: thumbnail.height
  }));
};

export const extractLockupVideoCount = (lockup: LockupViewApproximation): number => {
  const videoCountText = extractLockupBadges(lockup).find(badge =>
    videoCountRegex.test(badge?.text ?? '')
  )?.text;

  if (!videoCountText) return undefined;

  return parseShortenedNumber(videoCountText);
};

export const extractShortsLockupId = (short: ShortsLockupViewApproximation): string => {
  return short?.on_tap_endpoint?.payload?.videoId;
};

export const extractShortsLockupViewCount = (short: ShortsLockupViewApproximation): number => {
  const viewCountText = short?.overlay_metadata?.secondary_text?.text;
  if (!viewCountText) return undefined;

  return parseShortenedNumber(viewCountText);
};
