import type { ApiDto } from '@viewtube/shared';
import { proxyManifest } from '~/utils/videoplayer/proxy';
import { isHlsSupportedNatively } from '~/utils/videoplayer/support';
import { SSR_SOURCE_REASON, type PlayerSource } from '~/utils/videoplayer/types';
import { useIsIOS } from './isIOS';

export const useVideoSource = (video: Ref<ApiDto<'VTVideoInfoDto'>>) => {
  const config = useRuntimeConfig();
  const { isIOSOnIPhone } = useIsIOS();

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

    // The `sabr` branch lands with SABR_PLAN.md phase 1, which adds the DTO field.

    if (currentVideo.dashManifest) {
      return {
        kind: 'dash',
        manifest: proxyManifest(currentVideo.dashManifest, proxyOrigin.value)
      };
    }

    return {
      kind: 'none',
      reason: currentVideo.live
        ? 'No HLS manifest for this live stream'
        : 'No playable source for this video'
    };
  });

  return { source };
};
