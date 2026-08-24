import { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';

type ThumbnailApproximation = Pick<VTThumbnailDto, 'url' | 'width' | 'height'>;

export type LockupBadgeApproximation = {
  text?: string;
  badge_style?: string;
  icon_name?: string;
};

type LockupOverlayApproximation = {
  type?: string;
  badges?: Array<LockupBadgeApproximation>;
  thumbnail?: Array<ThumbnailApproximation>;
};

type LockupThumbnailApproximation = {
  image?: Array<ThumbnailApproximation>;
  overlays?: Array<LockupOverlayApproximation>;
};

type LockupAvatarApproximation = {
  avatar?: { image?: Array<ThumbnailApproximation> } | null;
  avatars?: Array<{ image?: Array<ThumbnailApproximation> }>;
  renderer_context?: {
    command_context?: {
      on_tap?: { payload?: { browseId?: string; canonicalBaseUrl?: string } };
    };
  };
};

type LockupMetadataApproximation = {
  title?: { text?: string } | null;
  metadata?: {
    metadata_rows?: Array<{
      metadata_parts?: Array<{ text?: { text?: string } | null }>;
      badges?: Array<LockupBadgeApproximation>;
    }>;
  } | null;
  image?: LockupAvatarApproximation | null;
};

export type LockupViewApproximation = {
  type?: string;
  content_id?: string;
  content_type?: string;
  metadata?: LockupMetadataApproximation | null;
  content_image?: LockupThumbnailApproximation | null;
  renderer_context?: {
    command_context?: { on_tap?: { payload?: { videoId?: string } } };
  };
};

export type ShortsLockupViewApproximation = {
  type?: string;
  entity_id?: string;
  accessibility_text?: string;
  thumbnail?: Array<ThumbnailApproximation>;
  on_tap_endpoint?: { payload?: { videoId?: string } };
  overlay_metadata?: {
    primary_text?: { text?: string } | null;
    secondary_text?: { text?: string } | null;
  } | null;
};
