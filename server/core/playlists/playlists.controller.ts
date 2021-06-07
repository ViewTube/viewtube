import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlaylistsService } from './playlists.service';

@ApiTags('Core')
@Controller('playlists')
export class PlaylistsController {
  constructor(private playlistsService: PlaylistsService) {}

  @Get()
  getPlaylist(@Query('playlistId') playlistId: string): Promise<any> {
    return this.playlistsService.getPlaylist(playlistId);
  }

  @Get('continuation')
  getPlaylistContinuation(@Query('continuationData') continuationData: Array<any>): Promise<any> {
    return this.playlistsService.continuePlaylist(continuationData);
  }
}
