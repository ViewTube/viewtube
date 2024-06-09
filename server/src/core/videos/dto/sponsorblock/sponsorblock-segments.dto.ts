import type { SponsorBlockSegmentDto } from './sponsorblock-segment.dto';

export class SponsorBlockSegmentsDto {
  hash: string;
  segments: Array<SponsorBlockSegmentDto>;
  videoID: string;
}
