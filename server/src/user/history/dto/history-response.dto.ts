import { VideoVisitDetailsDto } from './video-visit-details.dto';

export class HistoryResponseDto {
  videos: Array<VideoVisitDetailsDto>;
  videoCount: number;
}
