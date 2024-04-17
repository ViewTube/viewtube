import type { VTEndscreenElementDto } from './endscreen/vt-endscreen-element.dto';
import type { VTInfoCardDto } from './infocard/vt-info-card.dto';
import type { VTCaptionTrackDto } from './vt-caption-track.dto';
import type { VTChapterDto } from './vt-chapter.dto';
import type { VTLegacyFormatDto } from './vt-legacy-format.dto';
import type { VTPreviewThumbnailDto } from './vt-preview-thumbnail.dto';
import type { VTThumbnailDto } from './vt-thumbnail.dto';
import type { VTVideoDto } from './vt-video.dto';

export class VTVideoInfoDto {
  id: string;
  title: string;
  subtitle: string;
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
  chapters: Array<VTChapterDto>;
  commentCount: number;
  legacyFormats: Array<VTLegacyFormatDto>;
  dashManifest?: string;
  dashManifestURI?: string;
  hlsManifestURI?: string;
}
