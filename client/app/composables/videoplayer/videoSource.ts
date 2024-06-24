import { VideoSourceType } from '#imports';
import type { ApiDto } from '@viewtube/shared';
import { isHlsSupportedNatively } from '~/utils/videoplayer/support';
import { useIsIOS } from './isIOS';

export const useVideoSource = (video: Ref<ApiDto<'VTVideoInfoDto'>>) => {
  const config = useRuntimeConfig();
  const { isIOSOnIPhone } = useIsIOS();

  const videoSource = computed(() => {
    let videoPlaybackProxy = `${window.location.origin}/api`;
    if (
      typeof config.public.videoplaybackProxy === 'string' &&
      config.public.videoplaybackProxy?.length > 0
    ) {
      videoPlaybackProxy = config.public.videoplaybackProxy;
    }

    let source: string = null;
    let sourceType: VideoSourceType = null;

    if (video.value.live && video.value.hlsManifestUrl) {
      if (isHlsSupportedNatively() && isIOSOnIPhone.value) {
        sourceType = VideoSourceType.NATIVE;
        source = video.value.hlsManifestUrl;
      } else {
        sourceType = VideoSourceType.HLS;
        source = video.value.hlsManifestUrl;
      }
    } else if (video.value.dashManifest) {
      const manifest = video.value.dashManifest.replace(googlevideoRegex, videoPlaybackProxy);
      sourceType = VideoSourceType.DASH;
      source = 'data:application/dash+xml;charset=utf-8;base64,' + btoa(manifest);
    }

    return { source, sourceType };
  });

  return {
    source: computed(() => videoSource.value.source),
    type: computed(() => videoSource.value.sourceType)
  };
};
