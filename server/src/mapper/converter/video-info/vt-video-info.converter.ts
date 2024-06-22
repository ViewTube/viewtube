import { VTVideoInfoDto } from 'server/mapper/dto/vt-video-info.dto';
import { VideoInfoSourceApproximation } from './video-info-source-approximation';
import {
  extractAuthor,
  extractAvailability,
  extractCaptions,
  extractCategory,
  extractChapters,
  extractCommentCount,
  extractDashManifestUrl,
  extractDescription,
  extractDuration,
  extractEndscreen,
  extractFamilyFriendly,
  extractHlsManifestUrl,
  extractInfoCards,
  extractKeywords,
  extractLegacyFormats,
  extractLikeCount,
  extractLive,
  extractPreviewThumbnails,
  extractPublished,
  extractRecommendedVideos,
  extractSubtitle,
  extractThumbnails,
  extractTitle,
  extractUnlisted,
  extractUpcoming,
  extractVideoId,
  extractViewCount
} from './vt-video-info.extractors';

type ToVTVideoInfoOptions = {
  dashManifest: string;
};
export const toVTVideoInfoDto = (
  videoInfo: VideoInfoSourceApproximation,
  { dashManifest }: ToVTVideoInfoOptions
): VTVideoInfoDto => {
  const id = extractVideoId(videoInfo);
  return {
    id,
    title: extractTitle(videoInfo),
    subtitle: extractSubtitle(videoInfo),
    author: extractAuthor(videoInfo),
    description: extractDescription(videoInfo),
    thumbnails: extractThumbnails(videoInfo),
    duration: extractDuration(videoInfo),
    published: extractPublished(videoInfo),
    viewCount: extractViewCount(videoInfo),
    upcoming: extractUpcoming(videoInfo),
    live: extractLive(videoInfo),
    unlisted: extractUnlisted(videoInfo),
    familyFriendly: extractFamilyFriendly(videoInfo),
    availability: extractAvailability(videoInfo),
    likeCount: extractLikeCount(videoInfo),
    category: extractCategory(videoInfo),
    previewThumbnails: extractPreviewThumbnails(videoInfo),
    endscreen: extractEndscreen(videoInfo),
    keywords: extractKeywords(videoInfo),
    captions: extractCaptions(videoInfo),
    infoCards: extractInfoCards(videoInfo),
    recommendedVideos: extractRecommendedVideos(videoInfo),
    chapters: extractChapters(videoInfo),
    commentCount: extractCommentCount(videoInfo),
    legacyFormats: extractLegacyFormats(videoInfo),
    hlsManifestUrl: extractHlsManifestUrl(videoInfo),
    dashManifestUrl: extractDashManifestUrl(videoInfo),
    dashManifest
  };
};
