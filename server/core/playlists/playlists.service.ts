import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class PlaylistsService {
  constructor() {}

  getPlaylist(playlistId: string, sortByNewest: boolean, continuation: string): Promise<any> {
    throw new InternalServerErrorException('Error fetching playlist');
  }
}
