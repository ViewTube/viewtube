import { VTSearchChannelResultDto } from './vt-search-channel-result.dto';
import { VTSearchMovieDto } from './vt-search-movie.dto';
import { VTSearchPlaylistDto } from './vt-search-playlist.dto';
import { VTSearchShelfDto } from './vt-search-shelf.dto';
import { VTSearchVideoResultDto } from './vt-search-video-result.dto';
import { VTShortsShelfDto } from './vt-shorts-shelf.dto';

export class VTSearchDto {
  results: Array<
    | VTSearchVideoResultDto
    | VTSearchChannelResultDto
    | VTSearchPlaylistDto
    | VTSearchMovieDto
    | VTSearchShelfDto
    | VTShortsShelfDto
  >;
  estimatedResultCount: number;
  refinements: string[];
}
