import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlaylistsService } from './playlists.service';

@ApiTags('Core')
@Controller('playlists')
export class PlaylistsController {
  constructor(private playlistsService: PlaylistsService) {}

  @Get()
  getPlaylist(
    @Query('playlistId') playlistId: string,
    @Query('pages') pages: number
  ): Promise<any> {
    return this.playlistsService.getPlaylist(playlistId, pages);
  }

  @Get('continuation')
  getPlaylistContinuation(@Query('continuationData') continuationData: Array<any>): Promise<any> {
    return this.playlistsService.continuePlaylist(continuationData);
  }
}
