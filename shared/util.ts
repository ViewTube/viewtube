export const getSecondsFromTimestamp = (timestamp: string) => {
  const timeStrings = timestamp.split(':');
  const reverseTimeStrings = timeStrings.reverse();
  let seconds = 0;

  if (reverseTimeStrings.length > 0) {
    seconds += parseInt(reverseTimeStrings[0]);
  }
  if (reverseTimeStrings.length > 1) {
    seconds += parseInt(reverseTimeStrings[1]) * 60;
  }
  if (reverseTimeStrings.length > 2) {
    seconds += parseInt(reverseTimeStrings[2]) * 3600;
  }

  return seconds;
};

export const getTimestampFromSeconds = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const secondsLeft = seconds - hours * 3600 - minutes * 60;

  let timestamp = '';
  if (hours > 0) {
    timestamp += hours + ':';
  }
  timestamp += minutes + ':';
  timestamp += secondsLeft;

  return timestamp;
};

/**
 * Checks if the VIEWTUBE_SECURE environment variable is set to true.
 * @returns {boolean}
 */
export const isHttps = (): boolean => {
  if (typeof process.env.VIEWTUBE_SECURE === 'boolean') {
    return process.env.VIEWTUBE_SECURE;
  }
  if (process.env.VIEWTUBE_SECURE === 'true') {
    return true;
  }
  return false;
};
