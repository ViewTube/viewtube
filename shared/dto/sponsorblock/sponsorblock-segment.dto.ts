export class SponsorBlockSegmentDto {
  UUID: string;
  category: string;
  segment: Array<number>;
  startPercentage?: number;
  endPercentage?: number;
}
