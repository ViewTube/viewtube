import { VideoVisitDto } from './video-visit.dto';

export class HistoryDto {
  username: string;

  videoHistory: Array<VideoVisitDto>;
}
