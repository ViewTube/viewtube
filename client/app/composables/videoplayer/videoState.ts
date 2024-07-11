import { VideoSourceType } from '#imports';
import type { ApiDto } from '@viewtube/shared';
import { useStorage } from '@vueuse/core';
import type { AudioTrack, Language, VideoTrack } from '~/interfaces/VideoState';
import { useMessagesStore } from '~/store/messages';
import { useSettingsStore } from '~/store/settings';
import { useUserStore } from '~/store/user';
import { useVideoPlayerStore } from '~/store/videoPlayer';
import { hlsAdapter } from '~/utils/videoplayer/adapters/hlsAdapter';
import { nativeAdapter } from '~/utils/videoplayer/adapters/nativeAdapter';
import { rxPlayerAdapter } from '~/utils/videoplayer/adapters/rxPlayerAdapter';
import { useMediaSession } from './mediaSession';

export type VideoState = ReturnType<typeof useVideoState>;

type VideoStateProps = {
  videoElementRef: Ref<HTMLVideoElement>;
  source: Ref<string>;
  video: ApiDto<'VTVideoInfoDto'>;
  sourceType: Ref<VideoSourceType>;
  videoEnded: () => void;
  startTime?: Ref<number>;
  autoplay?: boolean;
  embed?: boolean;
};

export const useVideoState = ({
  videoElementRef,
  source,
  video,
  sourceType,
  videoEnded,
  startTime,
  autoplay,
  embed
}: VideoStateProps) => {
  const settingsStore = useSettingsStore();
  const userStore = useUserStore();
  const videoPlayerStore = useVideoPlayerStore();
  const messagesStore = useMessagesStore();
  const { vtFetch } = useVtFetch();
  const { apiUrl } = useApiUrl();
  const volumeStorage = useStorage('volume', 1);
  const route = useRoute();

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

  const adapterInstance = ref<Awaited<ReturnType<typeof rxPlayerAdapter>>>();

  const instantiateAdapter = async () => {
    if (adapterInstance.value) {
      adapterInstance.value.destroy();
      adapterInstance.value = undefined;
    }

    if (sourceType.value === VideoSourceType.DASH) {
      adapterInstance.value = await rxPlayerAdapter({
        autoplay,
        defaultVolume: volumeStorage,
        loop: settingsStore.alwaysLoopVideo,
        maximumQuality: settingsStore.maxVideoQuality,
        source,
        startTime,
        videoElementRef,
        videoState,
        videoEnded,
        createMessage: messagesStore.createMessage
      });
    } else if (sourceType.value === VideoSourceType.HLS) {
      adapterInstance.value = await hlsAdapter({
        autoplay,
        defaultVolume: volumeStorage,
        maximumQuality: settingsStore.maxVideoQuality,
        source,
        startTime,
        videoElementRef,
        videoState,
        videoEnded,
        createMessage: messagesStore.createMessage
      });
    } else if (sourceType.value === VideoSourceType.NATIVE) {
      adapterInstance.value = await nativeAdapter({
        autoplay,
        defaultVolume: volumeStorage,
        loop: settingsStore.alwaysLoopVideo,
        source,
        startTime,
        videoElementRef,
        videoState,
        videoEnded,
        createMessage: messagesStore.createMessage
      });
    }
  };

  onMounted(async () => {
    await instantiateAdapter();
    setLoop(settingsStore.alwaysLoopVideo);
    setPlaybackRate(settingsStore.defaultVideoSpeed);

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
  const stop = () => adapterInstance.value?.stop();
  const setVolume = (volume: number) => {
    const clampedVolume = clamp(volume, 0, 1);
    volumeStorage.value = clampedVolume;
    adapterInstance.value?.setVolume(clampedVolume);
  };
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
    if (settingsStore.saveVideoHistory && !embed && userStore.isLoggedIn && !video.live) {
      vtFetch(`${apiUrl.value}user/history/${video.id}`, {
        method: 'POST',
        body: {
          progressSeconds: videoState.currentTime,
          lengthSeconds: videoState.duration
        },
        credentials: 'include'
      }).catch(_ => { });
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

  onBeforeUnmount(() => {
    adapterInstance.value?.destroy();
  });

  const onNextTrack = () => {
    videoEnded();
  };

  useMediaSession({ video, videoState, play, pause, stop, setTime, onNextTrack });

  function clamp(value: number, min: number, max: number): number {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }

  return {
    video: videoState,
    play,
    pause,
    stop,
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
