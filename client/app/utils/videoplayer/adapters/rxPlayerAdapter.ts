import type { IAvailableAudioTrack, IAvailableVideoTrack } from 'rx-player/types';
import type { AudioTrack, Language, VideoTrack } from '~/interfaces/VideoState';

export type RxPlayerAdapterOptions = {
  videoElementRef: Ref<HTMLVideoElement>;
  source: Ref<string>;
  startTime?: Ref<number>;
  videoState: VideoState['video'];
  defaultVolume: Ref<number>;
  videoEnded: () => void;
  createMessage: (...args: any[]) => void;
  autoplay?: boolean;
  loop?: boolean;
  maximumQuality?: string;
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

export const rxPlayerAdapter = async ({
  videoElementRef,
  source,
  startTime,
  videoState,
  defaultVolume,
  videoEnded,
  createMessage,
  autoplay,
  loop,
  maximumQuality
}: RxPlayerAdapterOptions) => {
  // RxPlayer.addFeatures([DASH_WASM]);

  const RxPlayer = await import('rx-player/minimal').then(module => module.default);
  const { DASH, DASH_WASM } = await import('rx-player/features');
  const { EMBEDDED_DASH_WASM, EMBEDDED_WORKER } = await import(
    'rx-player/experimental/features/embeds'
  );

  try {
    RxPlayer.addFeatures([DASH]);
    await DASH_WASM.initialize({ wasmUrl: EMBEDDED_DASH_WASM }).catch(() => {});
  } catch {
    // Ignore
  }

  const createPlayer = async () => {
    const player = new RxPlayer({
      videoElement: videoElementRef.value
    });
    try {
      await player.attachWorker({ workerUrl: EMBEDDED_WORKER, dashWasmUrl: EMBEDDED_DASH_WASM });
    } catch {
      // Ignore
    }
    return player;
  };

  const initialLoaded = ref(false);

  const registerEvents = () => {
    playerInstance?.addEventListener('playerStateChange', state => {
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
          if (!initialLoaded.value) {
            limitQuality();
            initialLoaded.value = true;
          }
          break;
        case PlayerState.PLAYING:
          videoState.playing = true;
          videoState.buffering = false;
          break;
        case PlayerState.PAUSED:
          videoState.playing = false;
          videoState.buffering = false;
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
          videoEnded();
          break;
        case PlayerState.RELOADING:
          videoState.buffering = true;
          break;
      }
    });

    playerInstance?.addEventListener('error', error => {
      console.log('error', error);
      createMessage({
        type: 'error',
        title: 'Video playback error',
        message: error.message
      });
      videoState.playerError = error;
    });

    playerInstance?.addEventListener('warning', warning => {
      if (warning?.message?.includes('MEDIA_ERR_BLOCKED_AUTOPLAY')) {
        createMessage({
          type: 'error',
          title: 'Autoplay blocked',
          message: 'Allow autoplay for this website to start the video automatically'
        });
      }
    });

    playerInstance?.addEventListener('positionUpdate', position => {
      videoState.currentTime = position.position;
      videoState.duration = position.duration;
      videoState.bufferLevel = position.position + position.bufferGap;
      videoState.speed = position.playbackRate;
    });

    playerInstance?.addEventListener('volumeChange', volume => {
      videoState.volume = volume.volume;
      videoState.muted = volume.muted;
    });

    playerInstance?.addEventListener('availableVideoTracksChange', videoTracks => {
      videoState.videoTracks = mapVideoTracks(videoTracks);
    });

    playerInstance?.addEventListener('availableAudioTracksChange', audioTracks => {
      videoState.audioTracks = mapAudioTracks(audioTracks);
    });

    playerInstance?.addEventListener('videoTrackChange', () => {
      refreshTracks();
    });

    playerInstance?.addEventListener('audioTrackChange', () => {
      refreshTracks();
    });

    playerInstance?.addEventListener('videoRepresentationChange', videoRepresentation => {
      currentVideoRepresentationId.value = videoRepresentation?.id?.toString();
      refreshTracks();
    });

    playerInstance?.addEventListener('audioRepresentationChange', audioRepresentation => {
      currentAudioRepresentationId.value = audioRepresentation?.id?.toString();
      refreshTracks();
    });
  };

  const limitQuality = () => {
    const maxHeight = parseInt(maximumQuality.replace('p', ''));

    const currentTrack = playerInstance?.getVideoTrack();

    const allowedRepresentations = currentTrack.representations.filter(representation => {
      return representation.height <= maxHeight;
    });

    playerInstance?.lockVideoRepresentations(
      allowedRepresentations.map(representation => representation.id)
    );
  };

  const currentVideoRepresentationId = ref<string | null>(null);
  const currentAudioRepresentationId = ref<string | null>(null);

  const refreshTracks = () => {
    videoState.videoTracks = mapVideoTracks(playerInstance?.getAvailableVideoTracks());
    videoState.audioTracks = mapAudioTracks(playerInstance?.getAvailableAudioTracks());
    videoState.languageList = mapLanguageList(playerInstance?.getAvailableAudioTracks());
    const currentLanguage = playerInstance?.getAudioTrack()?.language;
    if (currentLanguage) videoState.selectedLanguage = currentLanguage;
  };

  const mapVideoTracks = (videoTracks: IAvailableVideoTrack[]): VideoTrack[] => {
    return videoTracks.map(track => {
      const codecs = track.representations.map(rep => rep.codec);
      const codec = [...new Set(codecs)].join(', ');

      return {
        codec,
        active: track.active,
        id: track.id,
        representations: track.representations?.map(representation => {
          const frameRateLabel = representation.frameRate > 30 ? representation.frameRate : '';

          let heightLabel = representation.height;

          switch (representation.width) {
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

          const videoLabel = `${heightLabel}p${frameRateLabel} · ${humanizeBitrate(representation.bitrate)}`;

          return {
            id: representation.id,
            label: videoLabel,
            bitrate: representation.bitrate,
            codec: representation.codec,
            width: representation.width,
            height: representation.height,
            frameRate: representation.frameRate,
            active: currentVideoRepresentationId.value === representation.id,
            hdr: !!representation.hdrInfo,
            hdrType: representation.hdrInfo?.eotf
          };
        })
      };
    });
  };

  const mapAudioTracks = (audioTracks: IAvailableAudioTrack[]): AudioTrack[] => {
    return audioTracks
      .filter(audioTrack => {
        if (videoState.languageList.length <= 1) return true;
        return videoState.selectedLanguage === audioTrack.language;
      })
      .map(track => {
        const codecs = track.representations.map(rep => rep.codec);
        const codec = [...new Set(codecs)].join(', ');

        return {
          codec,
          active: track.active,
          id: track.id,
          language: track.language,
          representations: track.representations?.map(representation => {
            return {
              id: representation.id?.toString(),
              label: humanizeBitrate(representation.bitrate),
              bitrate: representation.bitrate,
              codec: representation.codec,
              active: currentAudioRepresentationId.value === representation.id
            };
          })
        };
      });
  };

  const mapLanguageList = (audioTracks: IAvailableAudioTrack[]): Language[] => {
    return audioTracks
      .map(track => {
        return {
          language: track.language,
          label: track.label,
          active: track.active
        };
      })
      .sort((a, b) => a.language.localeCompare(b.language))
      .filter(
        (language, index, self) => self.findIndex(l => l.language === language.language) === index
      );
  };

  const loadVideo = () => {
    playerInstance?.loadVideo({
      transport: 'dash',
      url: source.value,
      startAt: {
        position: startTime?.value || 0
      },
      autoPlay: autoplay,
      requestConfig: {
        segment: {
          maxRetry: 999
        }
      }
    });
    if (videoElementRef.value) {
      videoElementRef.value.loop = loop;
      videoState.loop = loop;
    }
  };

  const destroy = () => {
    playerInstance?.stop();
    playerInstance?.dispose();
  };
  const play = () => playerInstance?.play();
  const pause = () => playerInstance?.pause();
  const stop = () => playerInstance?.pause();
  const setVolume = (volume: number) => playerInstance?.setVolume(volume);
  const setPlaybackRate = (playbackRate: number) => playerInstance?.setPlaybackRate(playbackRate);
  const setTime = (time: number) => {
    playerInstance?.seekTo(time);
  };

  const setLanguage = (language: string) => {
    const trackId = playerInstance
      ?.getAvailableAudioTracks()
      .find(track => track.language === language)?.id;
    if (!trackId) return;

    playerInstance?.setAudioTrack({ trackId, switchingMode: 'direct' });
  };
  const setVideoRepresentation = (videoTrackId: string, videoRepresentationId: string) => {
    playerInstance?.setVideoTrack({
      trackId: videoTrackId,
      switchingMode: 'seamless',
      lockedRepresentations: [videoRepresentationId]
    });
    videoState.automaticVideoQuality = false;
    refreshTracks();
  };
  const setAutoVideoQuality = () => {
    playerInstance?.unlockVideoRepresentations();
    videoState.automaticVideoQuality = true;
    limitQuality();
  };
  const setAudioRepresentation = (audioTrackId: string, audioRepresentationId: string) => {
    playerInstance?.setAudioTrack({
      trackId: audioTrackId,
      switchingMode: 'seamless',
      lockedRepresentations: [audioRepresentationId]
    });
    videoState.automaticAudioQuality = false;
  };
  const setAutoAudioQuality = () => {
    playerInstance?.unlockAudioRepresentations();
    videoState.automaticAudioQuality = true;
  };

  const playerInstance = await createPlayer();
  registerEvents();
  playerInstance.setVolume(defaultVolume.value);
  videoState.volume = defaultVolume.value;
  loadVideo();

  return {
    destroy,
    play,
    pause,
    stop,
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
