import { VTVideoInfoDto } from 'server/mapper/dto/vt-video-info.dto';
import { VideoInfoSourceApproximation } from './video-info-source-approximation';
import {
  extractVideoId,
  extractAuthor,
  extractCaptions,
  extractCategory,
  extractChapters,
  extractCommentCount,
  extractDescription,
  extractDuration,
  extractEndscreen,
  extractFamilyFriendly,
  extractInfoCards,
  extractKeywords,
  extractLikeCount,
  extractLive,
  extractPreviewThumbnails,
  extractPublished,
  extractRecommendedVideos,
  extractThumbnails,
  extractTitle,
  extractUnlisted,
  extractUpcoming,
  extractViewCount,
  extractSubtitle,
  extractLegacyFormats
} from './vt-video-info.extractors';
import { createDashManifestURI } from 'server/mapper/utils/dash-manifest-uri';
import { logger } from 'server/common/logger';

type ToVTVideoInfoOptions = {
  dashManifest: string;
};
export const toVTVideoInfoDto = (
  videoInfo: VideoInfoSourceApproximation,
  { dashManifest }: ToVTVideoInfoOptions
): VTVideoInfoDto => {
  const id = extractVideoId(videoInfo);
  logger.log(`Parsing video ${id}`);
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
    dashManifest,
    dashManifestURI: createDashManifestURI(dashManifest)
  };
};
