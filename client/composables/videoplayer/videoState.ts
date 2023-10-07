import {
  VideoplaybackAdapterResponse,
  VideoplaybackAdapterType
} from '@/utils/videoplayer/adapters/adapter';

export type VideoState = {
  playing: boolean;
  buffering: boolean;
  bufferLevel: number;
  currentTime: number;
  duration: number;
  volume: number;
  loop: boolean;
  speed: number;
  videoQualityList: string[];
  audioQualityList: string[];
  videoTrackList: string[];
  audioTrackList: string[];
};

export const useVideoState = (
  videoElementRef: Ref<HTMLVideoElement>,
  adapterType: Ref<VideoplaybackAdapterType>,
  source: Ref<string>,
  startTime?: Ref<number>
) => {
  const videoState = reactive({
    playing: false,
    buffering: false,
    bufferLevel: 0,
    currentTime: 0,
    duration: 0,
    volume: 1,
    loop: false,
    speed: 1,
    videoQualityList: [],
    audioQualityList: [],
    videoTrackList: [],
    audioTrackList: []
  });

  const adapterInstance = ref<VideoplaybackAdapterResponse>();

  const instantiateAdapter = async () => {
    if (adapterInstance.value) {
      adapterInstance.value.destroy();
      adapterInstance.value = undefined;
    }

    switch (adapterType.value) {
      case 'dash':
        adapterInstance.value = await dashAdapter({ videoRef: videoElementRef, source, startTime });
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
    adapterInstance.value.onStreamActivated(() => {
      updateTimeAndDuration();
      updateQualityLists();
    });
    adapterInstance.value.onStreamTeardownComplete(() => {
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
    });
    adapterInstance.value.onVolumeChanged(() => {
      videoState.volume = adapterInstance.value?.getVolume() ?? 1;
    });
    adapterInstance.value.onPlaybackRateChanged(() => {
      videoState.speed = adapterInstance.value?.getPlaybackRate() ?? 1;
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

  const updateQualityLists = () => {
    if (adapterInstance.value) {
      videoState.videoQualityList = adapterInstance.value.getVideoQualityList();
      videoState.audioQualityList = adapterInstance.value.getAudioQualityList();
      videoState.videoTrackList = adapterInstance.value.getVideoTrackList();
      videoState.audioTrackList = adapterInstance.value.getAudioTrackList();
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

  watch(
    () => videoState.playing,
    newValue => {
      if (newValue) {
        adapterInstance.value?.play();
      } else {
        adapterInstance.value?.pause();
      }
    }
  );
  watch(
    () => videoState.volume,
    newValue => {
      adapterInstance.value?.setVolume(newValue);
    }
  );
  watch(
    () => videoState.speed,
    newValue => {
      adapterInstance.value?.setPlaybackRate(newValue);
    }
  );
  watch(
    () => videoState.currentTime,
    newValue => {
      adapterInstance.value?.setTime(newValue);
    }
  );
  watch(
    () => videoState.loop,
    newValue => {
      videoElementRef.value.loop = newValue;
    }
  );

  return {
    videoState
  };
};

const isReasonableNumber = (value: number) => {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
};
