import { VideoVisitDetailsDto } from '../history/dto/video-visit-details.dto';

export class UserprofileDetailsDto {
  username: string;

  videoHistory: Array<VideoVisitDetailsDto>;

  registeredAt: Date;

  totalVideosCount: number;

  totalTimeString: string;

  subscribedChannelsCount: number;
}
