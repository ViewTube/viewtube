import type { VTSearchChannelResultDto } from './vt-search-channel-result.dto';
import type { VTSearchMovieDto } from './vt-search-movie.dto';
import type { VTSearchPlaylistDto } from './vt-search-playlist.dto';
import type { VTSearchShelfDto } from './vt-search-shelf.dto';
import type { VTSearchVideoResultDto } from './vt-search-video-result.dto';
import type { VTShortsShelfDto } from './vt-shorts-shelf.dto';

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
