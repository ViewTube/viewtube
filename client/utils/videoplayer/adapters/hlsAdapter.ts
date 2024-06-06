import type { Level } from 'hls.js';
import type { VideoTrack } from '~/interfaces/VideoState';
import type { RxPlayerAdapterOptions } from './rxPlayerAdapter';

type HlsAdapterOptions = RxPlayerAdapterOptions;

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

export const hlsAdapter = async ({
  videoElementRef,
  source,
  videoState,
  volumeStorage,
  videoEnded,
  createMessage,
  autoplay
}: HlsAdapterOptions) => {
  const { streamProxy } = useProxyUrls();

  const Hls = await import('hls.js').then(module => module.default);

  const createPlayer = () => {
    const player = new Hls({
      enableWorker: true,
      backBufferLength: 400,
      maxBufferLength: 90,
      // liveDurationInfinity: true,
      lowLatencyMode: true,
      progressive: true,
      fetchSetup(context, initParams) {
        if (!context.url.includes(streamProxy)) {
          context.url = streamProxy + encodeURI(context.url);
        }
        return new Request(context.url, initParams);
      },
      xhrSetup(xhr: XMLHttpRequest, url: string) {
        if (!url.includes(streamProxy)) {
          xhr.open('GET', streamProxy + encodeURI(url), true);
        } else {
          xhr.open('GET', url, true);
        }
      }
    });
    player?.attachMedia(videoElementRef.value);
    return player;
  };

  const registerEvents = () => {
    videoElementRef.value?.addEventListener('canplay', () => {
      videoState.buffering = false;
    });
    videoElementRef.value?.addEventListener('playing', () => {
      videoState.playing = true;
      videoState.buffering = false;
    });
    videoElementRef.value?.addEventListener('pause', () => {
      videoState.playing = false;
      videoState.buffering = false;
    });
    videoElementRef.value?.addEventListener('waiting', () => {
      videoState.buffering = true;
    });
    videoElementRef.value?.addEventListener('ended', () => {
      videoState.playing = false;
      videoState.buffering = false;
      videoEnded();
    });
    videoElementRef.value?.addEventListener('canplay', async () => {
      if (autoplay) {
        try {
          await videoElementRef.value?.play();
        } catch {
          createMessage({
            type: 'error',
            title: 'Autoplay blocked',
            message: 'Allow autoplay for this website to start the video automatically'
          });
        }
      }
    });

    videoElementRef.value?.addEventListener('timeupdate', () => {
      if (videoElementRef.value) {
        videoState.currentTime = videoElementRef.value?.currentTime;
        videoState.duration = playerInstance?.liveSyncPosition;

        if (
          videoElementRef.value?.currentTime >= playerInstance?.liveSyncPosition - 2 &&
          videoElementRef.value?.playbackRate > 1
        ) {
          setPlaybackRate(1);
        }
      }
    });
    videoElementRef.value?.addEventListener('volumechange', () => {
      videoState.volume = videoElementRef.value.volume;
      videoState.muted = videoElementRef.value.muted;
    });

    playerInstance?.on(Hls.Events.ERROR, (event, data) => {
      if (!['fragParsingError', 'bufferStalledError'].includes(data.details)) {
        console.log('error', event, data);
        videoState.playerError = {
          message: data.details,
          name: data.type
        };
        createMessage({
          type: 'error',
          title: `Video player error: ${data.details}`,
          message: data.error.message
        });
      }
    });

    playerInstance?.on(Hls.Events.LEVEL_SWITCHING, () => {
      refreshTracks();
    });
    playerInstance?.on(Hls.Events.LEVEL_SWITCHED, () => {
      refreshTracks();
    });
    playerInstance?.on(Hls.Events.LEVEL_UPDATED, () => {
      refreshTracks();
    });
    playerInstance?.on(Hls.Events.LEVEL_LOADING, () => {
      refreshTracks();
    });
    playerInstance?.on(Hls.Events.LEVEL_LOADED, () => {
      refreshTracks();
    });
  };

  const currentVideoRepresentationId = ref<string | null>(null);

  const refreshTracks = () => {
    videoState.videoTracks = mapVideoTracks(playerInstance?.levels);
  };

  const mapVideoTracks = (levels: Level[]): VideoTrack[] => {
    const codec = [...new Set(levels?.map(el => el.codecSet))].join(', ');
    const currentLevel = playerInstance?.currentLevel;
    currentVideoRepresentationId.value = currentLevel?.toString();
    return [
      {
        codec,
        active: true,
        id: '0',
        representations: levels.map((level, index) => {
          let heightLabel = level.height;
          const frameRateLabel = level.frameRate > 30 ? level.frameRate : '';

          switch (level.width) {
            case 3840:
              heightLabel = 2560;
              break;
            case 2560:
              heightLabel = 1440;
              break;
            case 1920:
              heightLabel = 1080;
              break;
            case 1280:
              heightLabel = 720;
              break;
            case 854:
              heightLabel = 480;
              break;
            case 640:
              heightLabel = 360;
              break;
            case 426:
              heightLabel = 240;
              break;
            case 256:
              heightLabel = 144;
              break;
          }

          const videoLabel = `${heightLabel}p${frameRateLabel} · ${humanizeBitrate(level.bitrate)}`;

          return {
            id: index.toString(),
            label: videoLabel,
            bitrate: level.bitrate,
            codec: level.codecSet,
            width: level.width,
            height: heightLabel,
            frameRate: level.frameRate,
            active: index === currentLevel,
            hdr: !!level.attrs?.HDR,
            hdrType: level.attrs?.HDR
          };
        })
      }
    ];
  };

  let playerInstance = createPlayer();

  watch(videoElementRef, (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) {
      playerInstance?.detachMedia();

      playerInstance?.attachMedia(newValue);

      newValue.volume = volumeStorage.value;
      loadVideo();
    }
  });

  watch(source, () => {
    loadVideo();
  });

  const loadVideo = () => {
    playerInstance?.loadSource(source.value);
  };

  const destroy = () => {
    playerInstance?.stopLoad();
    playerInstance?.destroy();
  };
  const play = () => videoElementRef.value?.play();
  const pause = () => videoElementRef.value?.pause();
  const setVolume = (volume: number) => {
    if (videoElementRef.value) {
      videoElementRef.value.volume = volume;
      videoState.volume = volume;
    }
  };
  const setPlaybackRate = (playbackRate: number) => {
    if (videoElementRef.value) {
      videoElementRef.value.playbackRate = playbackRate;
      videoState.speed = playbackRate;
    }
  };
  const setTime = (time: number) => {
    if (videoElementRef.value) {
      videoElementRef.value.currentTime = time;
    }
  };

  const setLanguage = (_: string) => {};

  const setVideoRepresentation = (videoTrackId: string, videoRepresentationId: string) => {
    if (playerInstance) {
      playerInstance.currentLevel = parseInt(videoRepresentationId);
      videoState.automaticVideoQuality = false;
      refreshTracks();
    }
  };
  const setAutoVideoQuality = () => {
    if (playerInstance) {
      playerInstance.currentLevel = -1;
      videoState.automaticVideoQuality = true;
    }
  };
  const setAudioRepresentation = (_audioTrackId: string, _audioRepresentationId: string) => {};
  const setAutoAudioQuality = () => {};

  playerInstance = createPlayer();
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
    setVideoRepresentation,
    setAutoVideoQuality,
    setAudioRepresentation,
    setAutoAudioQuality
  };
};
