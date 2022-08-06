import { PlaylistBasicInfoDto } from '../playlist/playlist-basic-info.dto';
import { VideoBasicInfoDto } from '../video/video-basic-info.dto';

export class VideoSectionSingleDto {
  title?: string;
  type: 'single';
  video?: VideoBasicInfoDto;
}

export class VideoSectionMultiDto {
  title?: string;
  type: 'multi';
  elements?: Array<VideoSectionMultiVideo | VideoSectionMultiPlaylist>;
}

export class VideoSectionMultiVideo extends VideoBasicInfoDto {
  type: 'video';
}

export class VideoSectionMultiPlaylist extends PlaylistBasicInfoDto {
  type: 'playlist';
}
