import { PlaylistBasicInfoDto } from 'server/src/core/playlists/dto/playlist-basic-info.dto';
import { VideoBasicInfoDto } from 'server/src/core/videos/dto/video-basic-info.dto';

export class VideoSectionDto {
  title?: string;
  type: 'single' | 'multi';
  videos?: Array<VideoBasicInfoDto>;
  video?: VideoBasicInfoDto;
  playlists?: Array<PlaylistBasicInfoDto>;
}
