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
