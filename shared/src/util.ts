export const getSecondsFromTimestamp = (timestamp: string) => {
  if (!timestamp) return 0;

  return timestamp
    .split(':')
    .reverse()
    .reduce((acc, time, i) => {
      return acc + parseInt(time) * Math.pow(60, i);
    }, 0);
};

/**
 * This function returns a timestamp in the format of HH:MM:SS from a number of seconds.
 */
export const getTimestampFromSeconds = (seconds: number): string => {
  if (!seconds) return '00:00';

  seconds = Math.floor(seconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const secondsLeft = seconds - hours * 3600 - minutes * 60;

  const padTime = (num: number) => num.toString().padStart(2, '0');

  return `${padTime(hours)}:${padTime(minutes)}:${padTime(secondsLeft)}`;
};

/**
 * Checks if the VIEWTUBE_SECURE environment variable is set to true.
 * @returns {boolean}
 */
export const isHttps = (): boolean => {
  if (typeof process.env.VIEWTUBE_SECURE === 'boolean') return process.env.VIEWTUBE_SECURE;
  if (process.env.VIEWTUBE_SECURE === 'true') return true;
  return false;
};
