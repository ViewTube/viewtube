import { VideoplaybackAdapter } from '~/utils/videoplayer/adapters/adapter';

export const useVideoState = (
  videoRef: Ref<HTMLVideoElement>,
  adapter: VideoplaybackAdapter,
  source: Ref<string>
) => {
  const videoState = reactive({
    playing: false,
    buffering: false,
    currentTime: 0,
    duration: 0,
    volume: 1
  });

  onMounted(async () => {
    const adapterInstance = await adapter(videoRef, source);
  });

  return {
    videoState
  };
};
