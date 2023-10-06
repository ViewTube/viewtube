import { ApiDto } from '@/utils/shared';

export const useVideoSource = (video: Ref<ApiDto<'VTVideoInfoDto'>>) => {
  const config = useRuntimeConfig();

  const videoSource = computed(() => {
    let videoPlaybackProxy = `${window.location.origin}/api`;
    if (
      typeof config.public.videoplaybackProxy === 'string' &&
      config.public.videoplaybackProxy?.length > 0
    ) {
      videoPlaybackProxy = config.public.videoplaybackProxy;
    }

    const manifest = video.value.dashManifest.replace(
      /https:\/\/.*?.googlevideo\.com/gi,
      videoPlaybackProxy
    );
    const manifestUrl = 'data:application/dash+xml;charset=utf-8;base64,' + btoa(manifest);
    return manifestUrl;
  });

  const adapterType = computed(() => {
    if (video.value.dashManifest) {
      return 'dash';
    }
    return 'native';
  });

  return {
    videoSource,
    adapterType
  };
};
