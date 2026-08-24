const DEFAULT_IMAGE_HOST_SUFFIXES = [
  'ytimg.com',
  'ggpht.com',
  'googleusercontent.com',
  'gstatic.com',
  'google.com',
  'youtube.com'
];

const STREAM_HOST_SUFFIXES = ['googlevideo.com', 'youtube.com'];

export const imageHostSuffixes = (): Array<string> => DEFAULT_IMAGE_HOST_SUFFIXES

export const streamHostSuffixes = (): Array<string> => STREAM_HOST_SUFFIXES;

export const isHostAllowed = (hostname: string, suffixes: Array<string>): boolean => {
  const host = hostname.toLowerCase();
  return suffixes.some(suffix => host === suffix || host.endsWith(`.${suffix}`));
};

export type ProxyTarget = { url?: URL; error?: string };

export const parseProxyTarget = (rawUrl: string, suffixes: Array<string>): ProxyTarget => {
  if (!rawUrl) {
    return { error: 'url parameter is required' };
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { error: 'url parameter is not a valid URL' };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { error: `protocol ${url.protocol} is not supported` };
  }

  if (!isHostAllowed(url.hostname, suffixes)) {
    return { error: `host ${url.hostname} is not allowed to be proxied` };
  }

  return { url };
};
