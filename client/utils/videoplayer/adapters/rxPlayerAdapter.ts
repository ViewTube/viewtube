import type { useSettingsStore } from '@/store/settings';
import RxPlayer from 'rx-player';

type RxPlayerAdapterOptions = {
  videoElementRef: Ref<HTMLVideoElement>;
  source: Ref<string>;
  startTime?: Ref<number>;
  settingsStore: ReturnType<typeof useSettingsStore>;
  videoState: VideoState['video'];
  volumeStorage: Ref<number>;
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

export const rxPlayerAdapter = ({
  videoElementRef,
  source,
  startTime,
  settingsStore,
  videoState,
  volumeStorage
}: RxPlayerAdapterOptions) => {
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
          videoState.buffering = false;
          break;
        case PlayerState.LOADING:
          videoState.buffering = true;
          break;
        case PlayerState.LOADED:
          videoState.buffering = false;
          break;
        case PlayerState.PLAYING:
          videoState.playing = true;
          videoState.buffering = false;
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
          videoState.buffering = false;
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

    playerInstance.value?.addEventListener('volumeChange', volume => {
      videoState.volume = volume.volume;
      videoState.muted = volume.muted;
    });
  };

  const playerInstance = ref<RxPlayer>(createPlayer());

  watch(videoElementRef, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      playerInstance.value?.stop();
      playerInstance.value?.dispose();

      playerInstance.value = createPlayer();
      registerEvents();
      playerInstance.value.setVolume(volumeStorage.value);
      7;
      loadVideo();
    }
  });

  watch(source, () => {
    loadVideo();
  });

  const loadVideo = () => {
    playerInstance.value?.loadVideo({
      transport: 'dash',
      url: source.value,
      startAt: {
        position: startTime?.value || 0
      },
      autoPlay: settingsStore.autoplay
    });

    setTimeout(() => {
      console.log('video', playerInstance.value?.getVideoRepresentation());
      console.log('audio', playerInstance.value?.getAvailableAudioTracks());
      console.log('periods', playerInstance.value?.getAvailablePeriods());
    }, 1000);
  };

  const destroy = () => {
    playerInstance.value?.stop();
    playerInstance.value?.dispose();
  };
  const play = () => playerInstance.value?.play();
  const pause = () => playerInstance.value?.pause();
  const setVolume = (volume: number) => playerInstance.value?.setVolume(volume);
  const setPlaybackRate = (playbackRate: number) =>
    playerInstance.value?.setPlaybackRate(playbackRate);
  const setTime = (time: number) => playerInstance.value?.seekTo(time);

  const setLanguage = (_language: string) => {};
  const setTrack = (_track: number) => {};
  const setAutoQuality = (_enabled: boolean) => {};

  playerInstance.value = createPlayer();
  registerEvents();
  loadVideo();

  return {
    destroy,
    play,
    pause,
    setVolume,
    setPlaybackRate,
    setTime,
    setLanguage,
    setTrack,
    setAutoQuality
  };
};
