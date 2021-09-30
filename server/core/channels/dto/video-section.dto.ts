import { PlaylistBasicInfoDto } from 'viewtube/server/core/playlists/dto/playlist-basic-info.dto';
import { VideoBasicInfoDto } from 'viewtube/server/core/videos/dto/video-basic-info.dto';

export class VideoSectionDto {
  title?: string;
  type: 'single' | 'multi';
  videos?: Array<VideoBasicInfoDto>;
  video?: VideoBasicInfoDto;
  playlists?: Array<PlaylistBasicInfoDto>;
}
