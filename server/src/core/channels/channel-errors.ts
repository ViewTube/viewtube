/**
 * Channel failures are answered as one of three things: 404 when YouTube has no such channel, 502
 * when YouTube was reachable but unusable (a token it refused, a renderer the mapper cannot read),
 * and nest's own `BadRequestException` for a malformed argument such as an empty continuation.
 *
 * A missing tab is none of those. It is answered with an empty result, and is detected by checking
 * youtubei.js's `has_videos` / `has_about` / `has_playlists` rather than by catching, so a renderer
 * change still fails loudly.
 */
import { BadGatewayException, Logger, NotFoundException } from '@nestjs/common';

const logger = new Logger('ChannelErrors');

export const channelNotFound = (description = 'No channel exists for that id'): never => {
  throw new NotFoundException({ message: 'Channel not found', description });
};

/** `operation` names the part being read: `page`, `home`, `playlists`. */
export const channelUpstreamFailed = (operation: string, error?: { message?: string }): never => {
  // `debug`, not `warn`: `ApiExceptionFilter` logs the 502 at `warn` with the request url,
  // and this line carries the specific youtubei.js message that the filter cannot see.
  logger.debug(`Reading channel ${operation} failed: ${error?.message ?? 'no reason given'}`);

  throw new BadGatewayException({
    message: `Error reading channel ${operation}`,
    description: 'YouTube did not answer with anything usable'
  });
};

/**
 * youtubei.js types a missing or terminated channel as `ChannelError`. An id YouTube itself rejects
 * arrives as a plain request failure carrying an INVALID_ARGUMENT body.
 */
export const isChannelGone = (error: {
  constructor?: { name?: string };
  info?: unknown;
}): boolean => {
  if (error?.constructor?.name === 'ChannelError') return true;

  if (typeof error?.info !== 'string') return false;

  try {
    return JSON.parse(error.info)?.error?.status === 'INVALID_ARGUMENT';
  } catch {
    return false;
  }
};
