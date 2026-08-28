import type { ApiDto } from '@viewtube/shared';
import { getVideoInfo } from '~/utils/api/videos';
import { proxyManifest, rewriteSabrHost, toManifestDataUri } from '~/utils/videoplayer/proxy';
import { isHlsSupportedNatively } from '~/utils/videoplayer/support';
import { SSR_SOURCE_REASON, type PlayerSource } from '~/utils/videoplayer/types';
import { useIsIOS } from './isIOS';

type SabrBlock = NonNullable<ApiDto<'VTVideoInfoDto'>['sabr']>;

/**
 * Shared by the reactive source and by the reload path so a refreshed session is built
 * exactly like the original one — the two drifting apart would only show up as a stall
 * hours into playback.
 */
const buildSabrSource = (sabr: SabrBlock, videoPlaybackProxy: string): PlayerSource => ({
  kind: 'sabr',
  manifest: toManifestDataUri(sabr.dashManifest),
  sabr: {
    streamingUrl: rewriteSabrHost(sabr.streamingUrl, videoPlaybackProxy),
    formats: sabr.formats,
    ustreamerConfig: sabr.ustreamerConfig,
    poToken: sabr.poToken ?? undefined,
    clientInfo: sabr.clientInfo
  }
});

export const useVideoSource = (video: Ref<ApiDto<'VTVideoInfoDto'>>) => {
  const config = useRuntimeConfig();
  const { isIOSOnIPhone } = useIsIOS();
  // Hoisted: calling this inside the computed would build a new computed each evaluation.
  const { videoPlaybackProxy } = useProxyUrls();

  // The manifest rewrite targets the proxy *origin* — googlevideoRegex matches the host
  // only, so the segment URL's own /videoplayback path survives. That is a different
  // string from useProxyUrls().videoPlaybackProxy, which is the full path and is what
  // the SABR endpoint rewrite will need.
  const proxyOrigin = computed(() => {
    const configured = config.public.videoplaybackProxy;
    if (typeof configured === 'string' && configured.length > 0) {
      return configured;
    }
    return `${window.location.origin}/api`;
  });

  const source = computed<PlayerSource>(() => {
    // isHlsSupportedNatively and proxyOrigin both touch browser globals, and embed/[id].vue
    // renders the player without waiting for the fetch to settle.
    if (!import.meta.client) return { kind: 'none', reason: SSR_SOURCE_REASON };

    const currentVideo = video.value;
    if (!currentVideo) return { kind: 'none', reason: SSR_SOURCE_REASON };

    if (currentVideo.live && currentVideo.hlsManifestUrl) {
      return isHlsSupportedNatively() && isIOSOnIPhone.value
        ? { kind: 'native', url: currentVideo.hlsManifestUrl }
        : { kind: 'hls', url: currentVideo.hlsManifestUrl };
    }

    // SABR is the only VOD path YouTube still serves; the legacy manifest below is a
    // fallback for responses that somehow carry one.
    if (currentVideo.sabr) {
      return buildSabrSource(currentVideo.sabr, videoPlaybackProxy);
    }

    if (currentVideo.dashManifest) {
      return {
        kind: 'dash',
        manifest: proxyManifest(currentVideo.dashManifest, proxyOrigin.value)
      };
    }

    return {
      kind: 'none',
      reason: currentVideo.live
        ? "Live stream isn't currently playable"
        : 'No playable source for this video'
    };
  });

  /**
   * Fetches a fresh SABR session for the video currently loaded. Returns null when the
   * server no longer offers a SABR block, which the caller must treat as "keep what you
   * have" rather than as a new source.
   */
  const refreshSource = async (): Promise<PlayerSource | null> => {
    const id = video.value?.id;
    if (!id) return null;

    const refreshed = await getVideoInfo(id);
    if (!refreshed?.sabr) return null;

    return buildSabrSource(refreshed.sabr, videoPlaybackProxy);
  };

  return { source, refreshSource };
};
