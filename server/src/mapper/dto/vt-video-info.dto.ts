import { VTEndscreenElementDto } from './endscreen/vt-endscreen-element.dto';
import { VTInfoCardDto } from './infocard/vt-info-card.dto';
import { VTCaptionTrackDto } from './vt-caption-track.dto';
import { VTChapterDto } from './vt-chapter.dto';
import { VTLegacyFormatDto } from './vt-legacy-format.dto';
import { VTPreviewThumbnailDto } from './vt-preview-thumbnail.dto';
import { VTThumbnailDto } from './vt-thumbnail.dto';
import { VTVideoDto } from './vt-video.dto';

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
  watching?: number;
  unlisted: boolean;
  familyFriendly: boolean;
  ageRestricted?: boolean;
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
  hlsManifestUrl?: string;
  dashManifestUrl?: string;
}
