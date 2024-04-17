import type { VideoVisitDetailsDto } from '../history/dto/video-visit-details.dto';

export class UserprofileDetailsDto {
  username: string;

  profileImage: string;

  videoHistory: Array<VideoVisitDetailsDto>;

  registeredAt: Date;

  totalVideosCount: number;

  totalTimeString: string;

  subscribedChannelsCount: number;

  admin: boolean;
}
