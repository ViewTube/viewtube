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

/**
 * Checks the protocol, parsed from the VIEWTUBE_URL environment variable.
 * @returns {boolean}
 * @throws Throws an error if VIEWTUBE_URL is undefined or an invalid URL.
 */
export const isHttps = (): boolean => new URL(getApiUrl()).protocol === 'https:';

/**
 * Returns the api url, parsed from the VIEWTUBE_URL environment variable.
 * @returns {string}
 * @throws Throws an error if VIEWTUBE_URL is undefined or an invalid URL.
 */
export const getApiUrl = (): string => {
  const urlEnv = process.env.VIEWTUBE_URL;

  if (urlEnv) {
    try {
      const urlObj = new URL(urlEnv);
      urlObj.pathname = 'api/';
      const url = urlObj.href;
      return url;
    } catch (error) {
      throw new Error(`Error parsing VIEWTUBE_URL, make sure it is a valid URL.\n${error}`);
    }
  } else {
    throw new Error('Unable to find domain, VIEWTUBE_URL may not be defined');
  }
};

/**
 * Returns the domain (hostname), parsed from the VIEWTUBE_URL environment variable.
 * @returns {string}
 * @throws Throws an error if VIEWTUBE_URL is undefined or an invalid URL.
 */
export const getViewtubeDomain = (): string => {
  const urlEnv = process.env.VIEWTUBE_URL;

  if (urlEnv) {
    try {
      const urlObj = new URL(urlEnv);
      return urlObj.hostname;
    } catch (error) {
      throw new Error(`Error parsing VIEWTUBE_URL, make sure it is a valid URL.\n${error}`);
    }
  } else {
    throw new Error('Unable to find domain, VIEWTUBE_URL may not be defined');
  }
};
