import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlaylistsService } from './playlists.service';

@ApiTags('Core')
@Controller('playlists')
export class PlaylistsController {
  constructor(private playlistsService: PlaylistsService) {}

  @Get(':playlistId')
  getComments(
    @Param('playlistId') playlistId: string,
    @Query('sortByNewest') sortByNewest: boolean = false,
    @Query('continuation') continuation: string = null
  ): Promise<any> {
    return this.playlistsService.getPlaylist(playlistId, sortByNewest, continuation);
  }
}
