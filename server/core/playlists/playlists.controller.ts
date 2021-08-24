import { CacheInterceptor, Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContinueResult, Result } from 'ytpl';
import { PlaylistsService } from './playlists.service';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('playlists')
export class PlaylistsController {
  constructor(private playlistsService: PlaylistsService) {}

  @Get()
  getPlaylist(
    @Query('playlistId') playlistId: string,
    @Query('pages') pages: number
  ): Promise<Result> {
    return this.playlistsService.getPlaylist(playlistId, pages);
  }

  @Get('continuation')
  getPlaylistContinuation(
    @Query('continuationData') continuationData: Array<any>
  ): Promise<ContinueResult> {
    return this.playlistsService.continuePlaylist(continuationData);
  }
}
