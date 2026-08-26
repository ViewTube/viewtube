export const HOME_FEED_CACHE_KEY = 'homefeed:mixed:v2';
export const HOME_FEED_COOLDOWN_KEY = 'homefeed:cooldown:v2';
export const CATEGORY_CACHE_PREFIX = 'homefeed:category:v2:';

export const DAY_MS = 86400000;
export const DEGRADED_TTL_MS = 900000;
export const COOLDOWN_TTL_MS = 60000;

export const SOURCE_TIMEOUT_MS = 8000;
export const MAX_HOME_FEED_VIDEOS = 42;
export const MIN_ACCEPTABLE_VIDEOS = 12;
export const MIN_CATEGORY_VIDEOS = 8;
export const MIN_REAL_HOME_FEED_VIDEOS = 8;

/**
 * YouTube retired the trending page, these topic channels are what is left of the
 * category feeds that can be read without an account.
 */
export const TOPIC_CHANNELS = {
  gaming: 'UCOpNcN46UbXVtpKMrmU4Abg',
  sports: 'UCEgdi0XIXXZ-qJOFPf4JSKw',
  live: 'UC4R8DWoMoI7CAwX8_LjQHig',
  learning: 'UCtFRv9O2AHqOZjjynzrv-xg',
  fashion: 'UCrpQ4p1Ql_hG8rKXIKM1MOQ'
} as const;
