import { Injectable, InternalServerErrorException } from '@nestjs/common';
import ytpl, { ContinueResult, Result } from 'ytpl';

@Injectable()
export class PlaylistsService {
  constructor() {}

  async getPlaylist(playlistId: string): Promise<Result> {
    if (playlistId && ytpl.validateID(playlistId)) {
      let playlistContent: Result;

      try {
        playlistContent = await ytpl(playlistId, { pages: 1 });
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
    let continuationArray = continuation;
    if (typeof continuation[2] === 'string') {
      continuationArray = [
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
