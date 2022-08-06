import { Mix, Playlist, Movie, Refinement, Shelf } from 'ytsr';
import { ChannelBasicInfoDto } from 'viewtube/shared/dto/channel/channel-basic-info.dto';
import { VideoBasicInfoDto } from 'viewtube/shared/dto/video/video-basic-info.dto';

export type SearchItem =
  | Mix
  | Playlist
  | ChannelBasicInfoDto
  | VideoBasicInfoDto
  | Movie
  | Refinement
  | Shelf;
