import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { ContinueResult, Options, Result } from 'ytpl';
import ytpl from 'ytpl';
import type { PlaylistResultDto } from './dto/playlist-result.dto';

@Injectable()
export class PlaylistsService {
  async getPlaylist(playlistId: string, pages: number): Promise<PlaylistResultDto> {
    if (playlistId && ytpl.validateID(playlistId)) {
      let playlistContent: Result;

      const ytplOptions: Options = {};

      if (pages) {
        ytplOptions.pages = pages;
      }

      try {
        playlistContent = await ytpl(playlistId, ytplOptions);
      } catch (error) {
        throw new InternalServerErrorException(error);
      }
      if (playlistContent) {
        return playlistContent;
      }
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
