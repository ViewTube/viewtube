import type {
  QualityInfo,
  VideoplaybackAdapterResponse,
  VideoplaybackAdapterType
} from '@/utils/videoplayer/adapters/adapter';
import { useStorage } from '@vueuse/core';
import { shakaAdapter } from '@/utils/videoplayer/adapters/shakaAdapter';

export type VideoState = ReturnType<typeof useVideoState>;

export const useVideoState = (
  videoElementRef: Ref<HTMLVideoElement>,
  adapterType: Ref<VideoplaybackAdapterType>,
  source: Ref<string>,
  startTime?: Ref<number>
) => {
  const volumeStorage = useStorage('volume', 1);

  const videoState = reactive({
    playing: false,
    buffering: false,
    bufferLevel: 0,
    currentTime: 0,
    duration: 0,
    volume: 1,
    loop: false,
    speed: 1,
    trackList: [],
    audioQualityList: [] as QualityInfo[],
    videoQualityAuto: true,
    audioQualityAuto: true,
    trackIndex: 0,
    audioQualityIndex: 0,
    videoTrackList: [],
    audioTrackList: [],
    languageList: [],
    selectedLanguage: 'en'
  });

  const adapterInstance = ref<VideoplaybackAdapterResponse>();

  const instantiateAdapter = async () => {
    if (adapterInstance.value) {
      adapterInstance.value.destroy();
      adapterInstance.value = undefined;
    }

    switch (adapterType.value) {
      case 'dash':
        adapterInstance.value = await shakaAdapter({
          videoRef: videoElementRef,
          source,
          startTime
        });

        break;
      case 'hls':
      case 'native':
        break;
    }

    adapterInstance.value.onPlaybackStarted(() => {
      videoState.playing = true;
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
    adapterInstance.value.onTrackChanged(id => {
      videoState.trackIndex = id;
    });
    adapterInstance.value.onLanguageChanged(language => {
      videoState.selectedLanguage = language;
    });
    adapterInstance.value.onAudioQualityChanged(e => {
      videoState.audioQualityIndex = e.newQuality;
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

  watch(adapterType, async (newValue, oldValue) => {
    if (newValue !== oldValue) {
      await instantiateAdapter();
    }
  });

  const updateTimeAndDuration = () => {
    updateTime();
    updateDuration();
  };

  const updateTrackLists = () => {
    if (adapterInstance.value) {
      videoState.trackList = adapterInstance.value.getTrackList();
      videoState.audioQualityList = adapterInstance.value.getAudioQualityList();
      videoState.videoTrackList = adapterInstance.value.getVideoTrackList();
      videoState.audioTrackList = adapterInstance.value.getAudioTrackList();
      videoState.languageList = adapterInstance.value.getLanguageList();
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

  return {
    video: videoState,
    play,
    pause,
    setVolume,
    setPlaybackRate,
    setTime,
    setLoop
  };
};

const isReasonableNumber = (value: number) => {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
};
