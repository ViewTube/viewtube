import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContinueResult } from 'ytpl';
import { PlaylistResultDto } from './dto/playlist-result.dto';
import { PlaylistsService } from './playlists.service';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('playlists')
export class PlaylistsController {
  constructor(private playlistsService: PlaylistsService) {}

  @Get(':playlistId')
  @CacheTTL(600000)
  getPlaylist(
    @Param('playlistId') playlistId: string,
    @Query('pages') pages: number
  ): Promise<PlaylistResultDto> {
    return this.playlistsService.getPlaylist(playlistId, pages);
  }

  @Get('continuation')
  getPlaylistContinuation(
    @Query('continuationData') continuationData: Array<any>
  ): Promise<ContinueResult> {
    return this.playlistsService.continuePlaylist(continuationData);
  }
}
