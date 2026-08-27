import { BadGatewayException, Logger, NotFoundException } from '@nestjs/common';

const logger = new Logger('VideoErrors');

export const videoNotFound = (description = 'No video exists for that id'): never => {
  throw new NotFoundException({ message: 'Video not found', description });
};

/** `operation` names the part being read: `information`, `dash manifest`. */
export const videoUpstreamFailed = (operation: string, error?: { message?: string }): never => {
  // `debug`, not `warn`: `ApiExceptionFilter` logs the 502 at `warn` with the request url,
  // and this line carries the specific youtubei.js message that the filter cannot see.
  logger.debug(`Reading video ${operation} failed: ${error?.message ?? 'no reason given'}`);

  throw new BadGatewayException({
    message: `Error reading video ${operation}`,
    description: 'YouTube did not answer with anything usable'
  });
};

export const isVideoGone = (error: {
  constructor?: { name?: string };
  info?: unknown;
}): boolean => {
  // MediaInfo throws InnertubeError with `info` set to the playability_status when its
  // status is 'ERROR' — a deleted, private, or otherwise unplayable video. Other
  // InnertubeErrors carry different info (a microformat, nothing) and are upstream failures.
  if (error?.constructor?.name === 'InnertubeError') {
    return (
      typeof error.info === 'object' &&
      error.info !== null &&
      (error.info as { status?: string }).status === 'ERROR'
    );
  }

  // An id YouTube itself rejects arrives as a plain request failure carrying an
  // INVALID_ARGUMENT body, same shape as isChannelGone.
  if (typeof error?.info !== 'string') return false;

  try {
    return JSON.parse(error.info)?.error?.status === 'INVALID_ARGUMENT';
  } catch {
    return false;
  }
};

/**
 * YouTube answered the player request with a playability status that carries no video at
 * all: `basic_info` is empty, so there is nothing to map into a DTO.
 *
 * In practice this is `LOGIN_REQUIRED` / "Sign in to confirm you're not a bot", which
 * YouTube applies per IP once it decides an instance is scraping — the same id plays again
 * from another address, and neither the video nor the viewer has anything to do with it.
 * Only `ERROR` throws inside youtubei.js (see `isVideoGone`); every other non-OK status
 * returns quietly, and without this the half-empty DTO reaches the client and the watch
 * page renders every field as undefined with no error shown at all.
 */
export const videoNotPlayable = (status?: string, reason?: string): never => {
  logger.debug(
    `YouTube returned no video data: ${status ?? 'no status'} — ${reason ?? 'no reason'}`
  );

  throw new BadGatewayException({
    message: 'YouTube refused to serve this video',
    description:
      status === 'LOGIN_REQUIRED'
        ? 'YouTube is asking this ViewTube server to sign in to prove it is not a bot. This is a limit on the server, not on you, and it usually clears by itself.'
        : reason || `YouTube answered with ${status ?? 'no playability status'} and no video data`
  });
};
