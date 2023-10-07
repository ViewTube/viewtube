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
  if (reverseTimeStrings.length > 3) {
    seconds += parseInt(reverseTimeStrings[3]) * 86400;
  }

  return seconds;
};

/**
 * This function returns a timestamp in the format of HH:MM:SS from a number of seconds.
 * @returns {string}
 */
export const getTimestampFromSeconds = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const secondsLeft = seconds - hours * 3600 - minutes * 60;

  let timestamp = '';
  if (hours > 0) {
    timestamp += hours + ':';
  }
  if (minutes < 10) {
    timestamp += '0';
  }
  timestamp += minutes + ':';
  if (secondsLeft < 10) {
    timestamp += '0';
  }
  timestamp += secondsLeft.toFixed(0);

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
