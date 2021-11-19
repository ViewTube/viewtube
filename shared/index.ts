import { AuthorThumbnailDto } from './dto/video/author-thumbnail.dto';
import { RecommendedVideoDto } from './dto/video/recommended-video.dto';
import { VideoThumbnailDto } from './dto/video/video-thumbnail.dto';
import { VideoDto } from './dto/video/video.dto';
import { SponsorBlockSegmentsDto } from './dto/sponsorblock/sponsorblock-segments.dto';
import { SponsorBlockSegmentDto } from './dto/sponsorblock/sponsorblock-segment.dto';
import { getSecondsFromTimestamp, getApiUrl, getViewtubeDomain, isHttps } from './util';

export {
  AuthorThumbnailDto,
  RecommendedVideoDto,
  VideoThumbnailDto,
  VideoDto,
  SponsorBlockSegmentsDto,
  SponsorBlockSegmentDto,
  getSecondsFromTimestamp,
  getApiUrl,
  getViewtubeDomain,
  isHttps
};
