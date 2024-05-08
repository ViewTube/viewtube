import { VideoSourceType } from '#imports';

export const useVideoSource = (video: Ref<ApiDto<'VTVideoInfoDto'>>) => {
  const config = useRuntimeConfig();
  const { m3u8Proxy } = useProxyUrls();

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

    if (video.value.live && video.value.hlsManifest) {
      const googlevideoRegex = /https:\/\/.*?.googlevideo\.com.*?\/index\.m3u8/gi;
      const hlsManifest = video.value.hlsManifest.replace(googlevideoRegex, match => {
        return `${window.location.origin}${m3u8Proxy}${encodeURI(match)}`;
      });
      console.log(hlsManifest);
      sourceType = VideoSourceType.HLS;
      source = 'data:application/x-mpegURL;charset=utf-8;base64,' + btoa(hlsManifest);
    } else if (video.value.dashManifest) {
      const googlevideoRegex = /https:\/\/.*?.googlevideo\.com/gi;
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
