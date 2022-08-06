import { VideoBasicInfoDto } from 'viewtube/shared/dto/video/video-basic-info.dto';
import {
  Channel,
  Clarification,
  GridMovie,
  HorizontalChannelList,
  Mix,
  Movie,
  Playlist,
  Result,
  Shelf,
  Show
} from 'ytsr';

export interface SearchResponse extends Omit<Result, 'items'> {
  items: Array<
    | VideoBasicInfoDto
    | Channel
    | Playlist
    | Mix
    | GridMovie
    | Movie
    | Show
    | Shelf
    | Clarification
    | HorizontalChannelList
  >;
}
