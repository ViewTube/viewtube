import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { sanitizeHtmlString } from 'server/common/sanitize-html';
import ytpl, { ContinueResult, Options, Result } from 'ytpl';

import { PlaylistResultDto } from './dto/playlist-result.dto';

const logger = new Logger('PlaylistsService');

@Injectable()
export class PlaylistsService {
  async getPlaylist(playlistId: string, pages: number): Promise<PlaylistResultDto> {
    if (!playlistId || !ytpl.validateID(playlistId)) {
      throw new BadRequestException('Invalid playlist ID');
    }

    const ytplOptions: Options = pages ? { pages } : {};

    try {
      const playlistContent: Result = await ytpl(playlistId, ytplOptions);
      if (playlistContent) {
        return {
          ...playlistContent,
          description: sanitizeHtmlString(playlistContent.description || '')
        };
      }
    } catch (error) {
      if (error?.statusCode === 404) {
        throw new NotFoundException({
          message: 'Playlist not found',
          description: 'No playlist exists for that id, or it is not public'
        });
      }

      logger.warn(`Reading playlist ${playlistId} failed: ${error?.message ?? 'no reason given'}`);
      throw new BadGatewayException({
        message: 'Error reading playlist',
        description: 'YouTube did not answer with anything usable'
      });
    }

    throw new BadGatewayException({
      message: 'Error reading playlist',
      description: 'YouTube did not answer with anything usable'
    });
  }

  async continuePlaylist(continuation: Array<any>): Promise<ContinueResult> {
    if (typeof continuation[2] !== 'string') {
      throw new BadRequestException('Invalid playlist continuation');
    }

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
      logger.warn(`Continuing a playlist failed: ${error?.message ?? 'no reason given'}`);
      throw new BadGatewayException({
        message: 'Error reading playlist',
        description: 'YouTube did not answer with anything usable'
      });
    }

    if (playlistContinuation) {
      return playlistContinuation;
    }

    throw new BadGatewayException({
      message: 'Error reading playlist',
      description: 'YouTube answered the continuation with nothing'
    });
  }
}
