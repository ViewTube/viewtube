import { Injectable, InternalServerErrorException } from '@nestjs/common';
import ytpl, { ContinueResult, Options, Result } from 'ytpl';
import { PlaylistResultDto } from './dto/playlist-result.dto';

@Injectable()
export class PlaylistsService {
  async getPlaylist(playlistId: string, pages: number): Promise<PlaylistResultDto> {
    if (!playlistId || !ytpl.validateID(playlistId)) {
      throw new InternalServerErrorException('Invalid playlist ID');
    }

    const ytplOptions: Options = pages ? { pages } : {};

    try {
      const playlistContent: Result = await ytpl(playlistId, ytplOptions);
      if (playlistContent) {
        return playlistContent;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    throw new InternalServerErrorException('Error fetching playlist');
  }

  async continuePlaylist(continuation: Array<any>): Promise<ContinueResult> {
    if (typeof continuation[2] === 'string') {
      const continuationArray = [
        continuation[0],
        continuation[1],
        JSON.parse(continuation[2]),
        JSON.parse(continuation[3])
      ];
      continuationArray[3].limit = Infinity;

      let playlistContinuation: ContinueResult;

      try {
        playlistContinuation = await ytpl.continueReq(continuationArray);
      } catch (error) {
        throw new InternalServerErrorException(error);
      }

      if (playlistContinuation) {
        return playlistContinuation;
      }
    }

    throw new InternalServerErrorException('Error fetching playlist');
  }
}
