import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import { generateVideoThumbnails } from 'server/mapper/utils/video-thumbnails';
import {
  LockupViewApproximation,
  ShortsLockupViewApproximation
} from './lockup-source-approximation';
import {
  extractLockupAuthor,
  extractLockupDuration,
  extractLockupId,
  extractLockupLive,
  extractLockupPublished,
  extractLockupRichThumbnails,
  extractLockupTitle,
  extractLockupViewCount,
  extractShortsLockupId,
  extractShortsLockupViewCount
} from './vt-lockup.extractors';

const videoContentTypes = ['UNSPECIFIED', 'VIDEO', 'SHORT', 'MOVIE', 'CLIP', 'PODCAST'];

export const toVTVideoDtoFromLockupView = (lockup: LockupViewApproximation): VTVideoDto | null => {
  if (lockup?.content_type && !videoContentTypes.includes(lockup.content_type)) {
    return null;
  }

  const id = extractLockupId(lockup);
  const title = extractLockupTitle(lockup);

  if (!id || !title) return null;

  return {
    id,
    title,
    author: extractLockupAuthor(lockup),
    thumbnails: generateVideoThumbnails(id),
    richThumbnails: extractLockupRichThumbnails(lockup),
    duration: extractLockupDuration(lockup),
    published: extractLockupPublished(lockup),
    viewCount: extractLockupViewCount(lockup),
    live: extractLockupLive(lockup)
  };
};

export const toVTVideoDtoFromShortsLockupView = (
  short: ShortsLockupViewApproximation
): VTVideoDto | null => {
  const id = extractShortsLockupId(short);
  const title = short?.overlay_metadata?.primary_text?.text;

  if (!id || !title) return null;

  return {
    id,
    title,
    thumbnails: generateVideoThumbnails(id),
    viewCount: extractShortsLockupViewCount(short)
  };
};
