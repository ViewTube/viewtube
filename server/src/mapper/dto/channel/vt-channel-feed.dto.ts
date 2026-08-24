import { VTVideoDto } from '../vt-video.dto';

export class VTChannelFeedDto {
  videos: Array<VTVideoDto>;
  continuation?: string;
  appliedSort?: 'newest' | 'oldest' | 'popular';
  /**
   * Empty when youtube offers no content filter for this channel, which is the case for every
   * channel without memberships. The client shows the control only when there is a choice.
   */
  availableFilters?: Array<'all' | 'public' | 'members'>;
  appliedFilter?: 'all' | 'public' | 'members';
}
