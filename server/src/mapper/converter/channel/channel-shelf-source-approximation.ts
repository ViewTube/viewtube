import { LockupViewApproximation } from 'server/mapper/converter/lockup/lockup-source-approximation';
import { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';

type ThumbnailApproximation = Pick<VTThumbnailDto, 'url' | 'width' | 'height'>;

type TextApproximation = { text?: string } | null;

export type GridChannelApproximation = {
  type?: string;
  id?: string;
  subscribers?: TextApproximation;
  video_count?: TextApproximation;
  author?: {
    id?: string;
    name?: string;
    thumbnails?: Array<ThumbnailApproximation>;
    is_verified?: boolean;
    is_verified_artist?: boolean;
    endpoint?: { payload?: { canonicalBaseUrl?: string } } | null;
  } | null;
};

/** The featured video at the top of the home tab, which is not a lockup like the rest. */
export type ChannelVideoPlayerApproximation = {
  type?: string;
  id?: string;
  title?: TextApproximation;
  description?: TextApproximation;
  view_count?: TextApproximation;
  published_time?: TextApproximation;
};

export type ChannelShelfItemApproximation =
  LockupViewApproximation | GridChannelApproximation | { type?: string };

export type ChannelShelfApproximation = {
  type?: string;
  title?: TextApproximation;
  /** `Shelf` nests its items in a HorizontalList, `ReelShelf` holds them directly. */
  content?: { items?: Array<ChannelShelfItemApproximation> } | null;
  items?: Array<ChannelShelfItemApproximation>;
};

export type ChannelHomeApproximation = {
  contents?: Array<{ contents?: Array<ChannelShelfApproximation> } | null>;
};
