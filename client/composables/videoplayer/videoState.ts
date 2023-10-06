import {
  VideoplaybackAdapterResponse,
  VideoplaybackAdapterType
} from '@/utils/videoplayer/adapters/adapter';

export const useVideoState = (
  videoRef: Ref<HTMLVideoElement>,
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
    speed: 1
  });

  const adapterInstance = ref<VideoplaybackAdapterResponse>();

  const instantiateAdapter = async () => {
    if (adapterInstance.value) {
      adapterInstance.value.destroy();
      adapterInstance.value = undefined;
    }

    switch (adapterType.value) {
      case 'dash':
        adapterInstance.value = await dashAdapter({ videoRef, source, startTime });
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
            videoState.loop = videoRef.value.loop;
          }
        }
      });
    });
    videoAttributeObserver.observe(videoRef.value, { attributes: true });
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
      videoRef.value.loop = newValue;
    }
  );

  return {
    videoState
  };
};

const isReasonableNumber = (value: number) => {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
};
