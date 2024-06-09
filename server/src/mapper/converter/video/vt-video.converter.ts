import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import { generateVideoThumbnails } from 'server/mapper/utils/video-thumbnails';
import Video from 'youtubei.js/dist/src/parser/classes/Video';
import {
  extractVideoAuthor,
  extractVideoDescription,
  extractVideoDuration,
  extractVideoId,
  extractVideoLive,
  extractVideoPublished,
  extractVideoRichThumbnails,
  extractVideoTitle,
  extractVideoUpcoming,
  extractVideoViewCount
} from './vt-video.extractors';

export type VideoSourceApproximation = Partial<VideoBasicInfoDto> &
  Partial<Video> & {
    videoID?: string;
    name?: string;
    authorArtist?: boolean;
    viewCount?: string;
    isLive?: boolean;
    authorUrl?: string;
    descriptionHtml?: string;
  };

export const toVTVideoDto = (video: VideoSourceApproximation | any): VTVideoDto => {
  const id = extractVideoId(video);
  return {
    id,
    title: extractVideoTitle(video),
    author: extractVideoAuthor(video),
    description: extractVideoDescription(video),
    thumbnails: generateVideoThumbnails(id),
    richThumbnails: extractVideoRichThumbnails(video),
    duration: extractVideoDuration(video),
    published: extractVideoPublished(video),
    viewCount: extractVideoViewCount(video),
    upcoming: extractVideoUpcoming(video),
    live: extractVideoLive(video)
  };
};
