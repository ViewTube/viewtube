import RxPlayer from 'rx-player';
import { useSettingsStore } from '~/store/settings';

type RxPlayerAdapterOptions = {
  videoElementRef: Ref<HTMLVideoElement>;
  source: Ref<string>;
  startTime?: Ref<number>;
};

enum PlayerState {
  STOPPED = 'STOPPED',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  BUFFERING = 'BUFFERING',
  FREEZING = 'FREEZING',
  SEEKING = 'SEEKING',
  ENDED = 'ENDED',
  RELOADING = 'RELOADING'
}

export const useRxPlayerAdapter = ({
  videoElementRef,
  source,
  startTime
}: RxPlayerAdapterOptions) => {
  const settingsStore = useSettingsStore();

  const createPlayer = () => {
    return new RxPlayer({
      videoElement: videoElementRef.value
    });
  };

  const registerEvents = () => {
    playerInstance.value?.addEventListener('playerStateChange', state => {
      switch (state) {
        case PlayerState.STOPPED:
          videoState.playing = false;
          break;
        case PlayerState.LOADING:
          videoState.buffering = true;
          break;
        case PlayerState.LOADED:
          videoState.buffering = false;
          break;
        case PlayerState.PLAYING:
          videoState.playing = true;
          break;
        case PlayerState.PAUSED:
          videoState.playing = false;
          break;
        case PlayerState.BUFFERING:
          videoState.buffering = true;
          break;
        case PlayerState.FREEZING:
          videoState.buffering = true;
          break;
        case PlayerState.SEEKING:
          videoState.buffering = true;
          break;
        case PlayerState.ENDED:
          videoState.playing = false;
          break;
        case PlayerState.RELOADING:
          videoState.buffering = true;
          break;
      }
    });

    playerInstance.value?.addEventListener('error', error => {
      videoState.playerError = error;
    });

    playerInstance.value?.addEventListener('positionUpdate', position => {
      videoState.currentTime = position.position;
      videoState.duration = position.duration;
      videoState.bufferLevel = position.position + position.bufferGap;
      videoState.speed = position.playbackRate;
    });
  };

  const playerInstance = ref<RxPlayer>(createPlayer());
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

  watch(videoElementRef, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      playerInstance.value?.stop();
      playerInstance.value?.dispose();

      playerInstance.value = createPlayer();
      registerEvents();
    }
  });

  watch(source, () => {
    playerInstance.value?.loadVideo({
      transport: 'dash',
      url: source.value,
      startAt: {
        position: startTime?.value || 0
      },
      autoPlay: settingsStore.autoplay
    });
  });

  onBeforeUnmount(() => {
    playerInstance.value?.stop();
    playerInstance.value?.dispose();
  });
};
