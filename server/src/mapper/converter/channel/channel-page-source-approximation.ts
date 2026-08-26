import { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';

type ThumbnailApproximation = Pick<VTThumbnailDto, 'url' | 'width' | 'height'>;

type TextApproximation = { text?: string } | null;

/**
 * YouTube retired the metadata badges on the channel header and now expresses "verified" and
 * "official artist" as an icon attached to a run of the title text.
 */
type TitleAttachmentApproximation = {
  element?: {
    type?: {
      imageType?: {
        image?: { sources?: Array<{ clientResource?: { imageName?: string } }> };
      };
    };
  };
};

type HeaderMetadataApproximation = {
  metadata_rows?: Array<{
    metadata_parts?: Array<{ text?: TextApproximation }>;
  }>;
} | null;

export type PageHeaderApproximation = {
  type?: string;
  content?: {
    title?: {
      text?: {
        text?: string;
        runs?: Array<{ attachment?: TitleAttachmentApproximation }>;
      } | null;
    } | null;
    image?: {
      avatar?: { image?: Array<ThumbnailApproximation> } | null;
    } | null;
    banner?: { image?: Array<ThumbnailApproximation> } | null;
    metadata?: HeaderMetadataApproximation;
  } | null;
};

/** The microformat block, which survived the view model migration unchanged. */
export type ChannelMetadataApproximation = {
  title?: string;
  description?: string;
  external_id?: string;
  vanity_channel_url?: string;
  is_family_safe?: boolean;
  tags?: Array<string>;
  available_countries?: Array<string>;
  avatar?: Array<ThumbnailApproximation>;
} | null;

export type ChannelPageApproximation = {
  header?: PageHeaderApproximation | null;
  metadata?: ChannelMetadataApproximation;
  tabs?: Array<string>;
};

export type ChannelLinkApproximation = {
  title?: TextApproximation;
  link?: {
    text?: string;
    endpoint?: { payload?: { url?: string } } | null;
  } | null;
  favicon?: Array<ThumbnailApproximation>;
};

/**
 * `aboutChannelViewModel`, which replaced `channelAboutFullMetadataRenderer`. Everything here is
 * a plain string except `joined_date`, which stayed a Text node.
 */
export type AboutChannelApproximation = {
  description?: string;
  country?: string;
  subscriber_count?: string;
  view_count?: string;
  video_count?: string;
  joined_date?: TextApproximation;
  canonical_channel_url?: string;
  channel_id?: string;
  links?: Array<ChannelLinkApproximation>;
} | null;
