export class SponsorBlockSegmentDto {
  UUID: string;
  category: string;
  segment: Array<number>;
  videoDuration: number;
  endPercentage?: number;
}
