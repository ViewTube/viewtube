import { googlevideoRegex } from '~/utils/googlevideoRegex';

/**
 * Segment URLs inside a DASH manifest are full googlevideo.com URLs whose own
 * `/videoplayback?...` path must survive. `googlevideoRegex` matches the host only, so
 * the replacement is a proxy *origin* without a path — distinct from
 * `useProxyUrls().videoPlaybackProxy`, which is the full `/api/videoplayback` path.
 */
export const proxyManifest = (manifest: string, proxyOrigin: string): string => {
  const proxied = manifest.replace(googlevideoRegex, proxyOrigin);
  return `data:application/dash+xml;charset=utf-8;base64,${toBase64(proxied)}`;
};

/** Rewrites a SABR streaming URL's origin to the proxy, keeping query params. */
export const rewriteSabrHost = (streamingUrl: string, videoPlaybackProxy: string): string => {
  const url = new URL(streamingUrl);
  const params = new URLSearchParams(url.searchParams);
  params.set('__host', url.host);
  return `${videoPlaybackProxy}?${params.toString()}`;
};

/** btoa() throws on any code point above U+00FF; manifests can carry non-Latin1 labels. */
const toBase64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};
