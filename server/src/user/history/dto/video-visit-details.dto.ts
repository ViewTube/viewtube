import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
import { VideoVisitDto } from './video-visit.dto';

export class VideoVisitDetailsDto extends VideoVisitDto {
  videoDetails: VideoBasicInfoDto;
}
