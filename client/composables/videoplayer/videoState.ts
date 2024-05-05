import { useStorage } from '@vueuse/core';
import type { AudioTrack, Language, VideoTrack } from '~/interfaces/VideoState';
import { useMessagesStore } from '~/store/messages';
import { useSettingsStore } from '~/store/settings';
import { useUserStore } from '~/store/user';
import { useVideoPlayerStore } from '~/store/videoPlayer';

export type VideoState = ReturnType<typeof useVideoState>;

export const useVideoState = (
  videoElementRef: Ref<HTMLVideoElement>,
  source: Ref<string>,
  video: ApiDto<'VTVideoInfoDto'>,
  format: Ref<string>,
  videoEnded: () => void,
  startTime?: Ref<number>,
  autoplay?: boolean
) => {
  const settingsStore = useSettingsStore();
  const userStore = useUserStore();
  const videoPlayerStore = useVideoPlayerStore();
  const messagesStore = useMessagesStore();
  const { vtFetch } = useVtFetch();
  const { apiUrl } = useApiUrl();
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
    videoTracks: [] as VideoTrack[],
    audioTracks: [] as AudioTrack[],
    automaticVideoQuality: true,
    automaticAudioQuality: true,
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
        videoState,
        volumeStorage,
        createMessage: messagesStore.createMessage,
        autoplay,
        videoEnded
      });
    } else {
      console.log('live stream');
    }
  };

  onMounted(async () => {
    await instantiateAdapter();
    if (videoElementRef.value instanceof HTMLVideoElement) {
      const videoAttributeObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'loop') {
              videoState.loop = videoElementRef.value.loop;
              videoPlayerStore.setLoop(videoElementRef.value.loop);
            }
          }
        });
      });
      videoAttributeObserver.observe(videoElementRef.value, { attributes: true });
    }
  });

  const play = () => adapterInstance.value?.play();
  const pause = () => {
    adapterInstance.value?.pause();
    saveVideoPosition();
  };
  const setVolume = (volume: number) => adapterInstance.value?.setVolume(volume);
  const setMuted = (muted: boolean) => (videoElementRef.value.muted = muted);
  const setPlaybackRate = (playbackRate: number) =>
    adapterInstance.value?.setPlaybackRate(playbackRate);
  const setTime = async (time: number) => {
    adapterInstance.value?.setTime(time);
    await nextTick();
    saveVideoPosition();
  };
  const setLoop = (loop: boolean) => {
    videoElementRef.value.loop = loop;
    videoPlayerStore.setLoop(loop);
  };
  const setLanguage = (language: string) => adapterInstance.value?.setLanguage(language);
  const setVideoRepresentation = (videoTrackId: string, videoRepresentationId: string) =>
    adapterInstance.value?.setVideoRepresentation(videoTrackId, videoRepresentationId);
  const setAudioRepresentation = (audioTrackId: string, audioRepresentationId: string) =>
    adapterInstance.value?.setAudioRepresentation(audioTrackId, audioRepresentationId);
  const setAutoVideoQuality = () => adapterInstance.value?.setAutoVideoQuality();
  const setAutoAudioQuality = () => adapterInstance.value?.setAutoAudioQuality();

  const saveVideoPosition = () => {
    if (settingsStore.saveVideoHistory) {
      if (userStore.isLoggedIn && !video.live) {
        vtFetch(`${apiUrl.value}user/history/${video.id}`, {
          method: 'POST',
          body: {
            progressSeconds: videoState.currentTime,
            lengthSeconds: videoState.duration
          },
          credentials: 'include'
        }).catch(_ => {});
      }
    }
  };

  const throttledSaveVideoPosition = useThrottleFn(saveVideoPosition, 5000);

  watch(
    () => videoState.currentTime,
    () => {
      throttledSaveVideoPosition();
      videoPlayerStore.setCurrentTime(videoState.currentTime);
      videoPlayerStore.setVideoLength(videoState.duration);
    }
  );

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
    setVideoRepresentation,
    setAudioRepresentation,
    setAutoVideoQuality,
    setAutoAudioQuality
  };
};
