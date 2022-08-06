import { VideoBasicInfoDto } from 'viewtube/shared/dto/video/video-basic-info.dto';
import { VideoVisitDto } from './video-visit.dto';

export class VideoVisitDetailsDto extends VideoVisitDto {
  videoDetails: VideoBasicInfoDto;
}
