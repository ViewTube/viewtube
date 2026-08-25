import { BadGatewayException, Logger, NotFoundException } from '@nestjs/common';

const logger = new Logger('VideoErrors');

export const videoNotFound = (description = 'No video exists for that id'): never => {
  throw new NotFoundException({ message: 'Video not found', description });
};

/** `operation` names the part being read: `information`, `dash manifest`. */
export const videoUpstreamFailed = (operation: string, error?: { message?: string }): never => {
  logger.warn(`Reading video ${operation} failed: ${error?.message ?? 'no reason given'}`);

  throw new BadGatewayException({
    message: `Error reading video ${operation}`,
    description: 'YouTube did not answer with anything usable'
  });
};

export const isVideoGone = (error: {
  constructor?: { name?: string };
  message?: string;
  info?: unknown;
}): boolean => {
  if (
    error?.constructor?.name === 'InnertubeError' &&
    error?.message === 'This video is unavailable'
  ) {
    return true;
  }

  if (typeof error?.info !== 'string') return false;

  try {
    return JSON.parse(error.info)?.error?.status === 'INVALID_ARGUMENT';
  } catch {
    return false;
  }
};
