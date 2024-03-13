import { useStorage } from '@vueuse/core';
import {
  shakaAdapter,
  type LabelledTrack,
  type Language
} from '@/utils/videoplayer/adapters/shakaAdapter';

export type VideoState = ReturnType<typeof useVideoState>;

export const useVideoState = (
  videoElementRef: Ref<HTMLVideoElement>,
  source: Ref<string>,
  startTime?: Ref<number>
) => {
  const volumeStorage = useStorage('volume', 1);

  const videoState = reactive({
    playing: false,
    buffering: true,
    bufferLevel: 0,
    currentTime: 0,
    duration: 0,
    volume: 1,
    loop: false,
    speed: 1,
    trackList: {} as Record<string, LabelledTrack[]>,
    automaticQuality: true,
    languageList: [] as Language[],
    selectedLanguage: 'en'
  });

  const adapterInstance = ref<Awaited<ReturnType<typeof shakaAdapter>>>();

  const instantiateAdapter = async () => {
    if (adapterInstance.value) {
      adapterInstance.value.destroy();
      adapterInstance.value = undefined;
    }

    adapterInstance.value = await shakaAdapter({
      videoRef: videoElementRef,
      source,
      startTime
    });

    adapterInstance.value.onPlaybackStarted(() => {
      videoState.playing = true;
      videoState.buffering = false;
      updateTimeAndDuration();
    });
    adapterInstance.value.onPlaybackPaused(() => {
      videoState.playing = false;
      updateTimeAndDuration();
    });
    adapterInstance.value.onPlaybackTimeUpdated(() => {
      updateTimeAndDuration();
    });
    adapterInstance.value.onBufferLevelUpdated(() => {
      videoState.bufferLevel = adapterInstance.value?.getBufferLevel() ?? 0;
    });
    adapterInstance.value.onWaiting(() => {
      videoState.buffering = true;
    });
    adapterInstance.value.onCanPlay(() => {
      videoState.buffering = false;
      updateTimeAndDuration();
      updateTrackLists();
      adapterInstance.value.setVolume(volumeStorage.value);
    });
    adapterInstance.value.onVolumeChanged(() => {
      videoState.volume = adapterInstance.value?.getVolume() ?? 1;
      volumeStorage.value = videoState.volume;
    });
    adapterInstance.value.onPlaybackRateChanged(() => {
      videoState.speed = adapterInstance.value?.getPlaybackRate() ?? 1;
    });
    adapterInstance.value.onLanguageChanged(language => {
      videoState.selectedLanguage = language;
      updateTrackLists();
    });
    adapterInstance.value.onAutomaticQualityChanged(abrStatus => {
      const enabled = abrStatus.newStatus;
      videoState.automaticQuality = enabled;
      updateTrackLists();
    });
    adapterInstance.value.onTracksChanged(() => {
      updateTrackLists();
    });
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

  const updateTimeAndDuration = () => {
    updateTime();
    updateDuration();
  };

  const updateTrackLists = () => {
    if (adapterInstance.value) {
      videoState.trackList = adapterInstance.value.getTrackList();

      videoState.languageList = adapterInstance.value.getLanguageList();

      videoState.selectedLanguage = adapterInstance.value
        .getRawTrackList()
        .find(track => track.active).language;
    }
  };

  const updateTime = () => {
    if (adapterInstance.value) {
      const currentTime = adapterInstance.value.getTime();
      if (isReasonableNumber(currentTime)) {
        videoState.currentTime = currentTime;
      } else {
        videoState.currentTime = 0;
      }
    }
  };

  const updateDuration = () => {
    if (adapterInstance.value) {
      const duration = adapterInstance.value.getDuration();
      if (isReasonableNumber(duration)) {
        videoState.duration = duration;
      } else {
        videoState.duration = 0;
      }
    }
  };

  const play = () => adapterInstance.value?.play();
  const pause = () => adapterInstance.value?.pause();
  const setVolume = (volume: number) => adapterInstance.value?.setVolume(volume);
  const setPlaybackRate = (playbackRate: number) =>
    adapterInstance.value?.setPlaybackRate(playbackRate);
  const setTime = (time: number) => adapterInstance.value?.setTime(time);
  const setLoop = (loop: boolean) => {
    videoElementRef.value.loop = loop;
  };
  const setLanguage = (language: string) => adapterInstance.value?.setLanguage(language);
  const setTrack = (track: number) => adapterInstance.value?.setTrack(track);
  const setAutoQuality = (enabled: boolean) => adapterInstance.value?.setAutoQuality(enabled);

  return {
    video: videoState,
    play,
    pause,
    setVolume,
    setPlaybackRate,
    setTime,
    setLoop,
    setLanguage,
    setTrack,
    setAutoQuality
  };
};

const isReasonableNumber = (value: number) => {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
};
