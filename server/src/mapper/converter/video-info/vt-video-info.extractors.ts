import { VTVideoInfoDto } from 'server/mapper/dto/vt-video-info.dto';
import { VideoInfoSourceApproximation } from './video-info-source-approximation';
import { parseRedirectUrl } from 'server/mapper/utils/parse-redirect';

export const extractVideoId = (videoInfo: VideoInfoSourceApproximation) => {
  return videoInfo?.basic_info?.id;
};

export const extractTitle = (videoInfo: VideoInfoSourceApproximation): string => {
  return videoInfo?.basic_info?.title;
};
export const extractAuthor = (
  videoInfo: VideoInfoSourceApproximation
): VTVideoInfoDto['author'] => {
  const owner = videoInfo?.secondary_info?.owner;
  const authorHandle = owner?.author?.endpoint?.payload?.canonicalBaseUrl?.replace('/', '');

  return {
    id: videoInfo?.basic_info?.channel_id,
    name: videoInfo?.basic_info?.author,
    handle: authorHandle,
    isArtist: owner?.author?.is_verified_artist === true,
    isVerified: owner?.author?.is_verified === true,
    subscriberCount: owner?.subscriber_count?.text,
    thumbnails: owner?.author?.thumbnails
  };
};

export const extractDescription = (videoInfo: VideoInfoSourceApproximation) => {
  const descriptionParts = videoInfo?.secondary_info?.description?.runs;
  if (!descriptionParts) {
    return videoInfo?.basic_info?.short_description;
  }

  let descriptionText = '';

  descriptionParts.forEach(part => {
    if (!part.endpoint) {
      descriptionText += part.text;
    } else if (part.endpoint.type === 'NavigationEndpoint') {
      if (part.endpoint?.payload?.url) {
        const url = parseRedirectUrl(part.endpoint?.payload?.url);
        descriptionText += url;
      } else if (part.endpoint?.payload?.videoId) {
        if (part.endpoint?.payload?.continuePlayback) {
          descriptionText += part.text;
        } else {
          descriptionText += `https://www.youtube.com/watch?v=${part.endpoint?.payload?.videoId}`;
        }
      } else {
        descriptionText += part.text;
      }
    }
  });

  return descriptionText;
};

export const extractThumbnails = (
  videoInfo: VideoInfoSourceApproximation
): VTVideoInfoDto['thumbnails'] => {};
export const extractDuration = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractPublished = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractViewCount = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractUpcoming = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractLive = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractUnlisted = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractFamilyFriendly = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractLikeCount = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractCategory = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractPreviewThumbnails = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractEndscreen = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractKeywords = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractCaptions = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractInfoCards = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractRecommendedVideos = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractChapters = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractCommentCount = (videoInfo: VideoInfoSourceApproximation) => {};
export const extractLegacyFormats = (videoInfo: VideoInfoSourceApproximation) => {};
