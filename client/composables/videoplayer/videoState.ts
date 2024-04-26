import { type LabelledTrack, type Language } from '@/utils/videoplayer/adapters/shakaAdapter';
import { useStorage } from '@vueuse/core';
import { useSettingsStore } from '~/store/settings';

export type VideoState = ReturnType<typeof useVideoState>;

export const useVideoState = (
  videoElementRef: Ref<HTMLVideoElement>,
  source: Ref<string>,
  format: Ref<string>,
  startTime?: Ref<number>
) => {
  const settingsStore = useSettingsStore();
  const volumeStorage = useStorage('volume', 1);
  const route = useRoute();

  const bufferMessage = ref('Instantiating player');

  const videoState = reactive({
    playing: false,
    buffering: true,
    bufferLevel: 0,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    loop: false,
    speed: 1,
    trackList: {} as Record<string, LabelledTrack[]>,
    automaticQuality: true,
    languageList: [] as Language[],
    selectedLanguage: 'en',
    playerError: null as Error | null
  });

  const adapterInstance = ref<ReturnType<typeof rxPlayerAdapter>>();

  const instantiateAdapter = async () => {
    if (adapterInstance.value) {
      adapterInstance.value.destroy();
      adapterInstance.value = undefined;
    }

    if (format.value === 'dash') {
      adapterInstance.value = rxPlayerAdapter({
        videoElementRef,
        source,
        startTime,
        settingsStore,
        videoState,
        volumeStorage
      });
    } else {
      console.log('live stream');
    }
  };

  onMounted(async () => {
    await instantiateAdapter();
    const videoAttributeObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          if (mutation.attributeName === 'loop') {
            videoState.loop = videoElementRef.value.loop;
          }
        }
      });
    });
    videoAttributeObserver.observe(videoElementRef.value, { attributes: true });
  });

  const play = () => adapterInstance.value?.play();
  const pause = () => adapterInstance.value?.pause();
  const setVolume = (volume: number) => adapterInstance.value?.setVolume(volume);
  const setMuted = (muted: boolean) => (videoElementRef.value.muted = muted);
  const setPlaybackRate = (playbackRate: number) =>
    adapterInstance.value?.setPlaybackRate(playbackRate);
  const setTime = (time: number) => adapterInstance.value?.setTime(time);
  const setLoop = (loop: boolean) => {
    videoElementRef.value.loop = loop;
  };
  const setLanguage = (language: string) => adapterInstance.value?.setLanguage(language);
  const setTrack = (track: number) => adapterInstance.value?.setTrack(track);
  const setAutoQuality = (enabled: boolean) => adapterInstance.value?.setAutoQuality(enabled);

  watch(
    () => route.query,
    newValue => {
      if (newValue.t) {
        setTime(Number(newValue.t));
      }
    }
  );

  return {
    video: videoState,
    bufferMessage,
    play,
    pause,
    setVolume,
    setMuted,
    setPlaybackRate,
    setTime,
    setLoop,
    setLanguage,
    setTrack,
    setAutoQuality
  };
};
