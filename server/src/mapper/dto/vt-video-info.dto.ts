import { VTEndscreenElementDto } from './endscreen/vt-endscreen-element.dto';
import { VTPreviewThumbnailDto } from './vt-preview-thumbnail.dto';
import { VTThumbnailDto } from './vt-thumbnail.dto';
import { VTCaptionTrackDto } from './vt-caption-track.dto';
import { VTInfoCardDto } from './infocard/vt-info-card.dto';
import { VTVideoDto } from './vt-video.dto';
import { VTLegacyFormatDto } from './vt-legacy-format.dto';

export class VTVideoInfoDto {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    thumbnails: Array<VTThumbnailDto>;
    isVerified: boolean;
    isArtist: boolean;
    handle: string;
    subscriberCount: string;
  };
  description: string;
  thumbnails: Array<VTThumbnailDto>;
  duration: {
    text: string;
    seconds: number;
  };
  published: {
    date: Date;
    text: string;
  };
  viewCount: number;
  upcoming?: Date;
  live: boolean;
  unlisted: boolean;
  familyFriendly: boolean;
  likeCount: number;
  category: string;
  previewThumbnails: Array<VTPreviewThumbnailDto>;
  endscreen: {
    elements: Array<VTEndscreenElementDto>;
    startMs: number;
  };
  keywords: Array<string>;
  captions: Array<VTCaptionTrackDto>;
  infoCards: Array<VTInfoCardDto>;
  recommendedVideos: Array<VTVideoDto>;
  chapters: Array<{ title: string; startMs: number; thumbnails: Array<VTThumbnailDto> }>;
  commentCount: number;
  legacyFormats: Array<VTLegacyFormatDto>;
}
