import type { IAvailableAudioTrack, IAvailableVideoTrack } from 'rx-player/types';
import type { AudioTrack, Language, VideoTrack } from '~/interfaces/VideoState';

export type ShakaAdapterOptions = RxPlayerAdapterOptions;

export const shakaAdapter: typeof rxPlayerAdapter = async ({
  videoElementRef,
  source,
  startTime,
  videoState,
  volumeStorage,
  videoEnded,
  createMessage,
  autoplay
}: ShakaAdapterOptions) => {
  const shaka = await import('shaka-player');

  shaka.polyfill.installAll();

  const createPlayer = () => {
    const player = new shaka.Player();
    player.configure({
      preferredAudioLanguage: 'en',
      abr: {
        restrictions: {
          maxPixels: 1920 * 1080
        }
      },
      streaming: {
        retryParameters: {
          maxAttempts: Infinity,
          baseDelay: 500,
          timeout: 30000
        },
        bufferingGoal: 30,
        bufferBehind: 60
      },
      manifest: {
        dash: {
          ignoreMinBufferTime: true,
          disableXlinkProcessing: true
        }
      }
    });
    return player;
  };

  const registerEvents = () => {
    videoElementRef.value?.addEventListener('playing', () => {
      videoState.playing = true;
      videoState.buffering = false;
    });
    videoElementRef.value?.addEventListener('pause', () => {
      videoState.playing = false;
      videoState.buffering = false;
    });
    videoElementRef.value?.addEventListener('timeupdate', () => {
      videoState.currentTime = videoElementRef.value?.currentTime || 0;
      videoState.duration = videoElementRef.value?.duration || 0;
    });
    playerInstance?.addEventListener('statechanged', e => {
      console.log('statechanged', e);
    });
    playerInstance?.addEventListener('onstatechange', e => {
      console.log('onstatechange', e);
    });

    // playerInstance.playerInstance?.addEventListener('playerStateChange', state => {
    //   switch (state) {
    //     case PlayerState.STOPPED:
    //       videoState.playing = false;
    //       videoState.buffering = false;
    //       break;
    //     case PlayerState.LOADING:
    //       videoState.buffering = true;
    //       break;
    //     case PlayerState.LOADED:
    //       videoState.buffering = false;
    //       break;
    //     case PlayerState.PLAYING:
    //       videoState.playing = true;
    //       videoState.buffering = false;
    //       break;
    //     case PlayerState.PAUSED:
    //       videoState.playing = false;
    //       videoState.buffering = false;
    //       break;
    //     case PlayerState.BUFFERING:
    //       videoState.buffering = true;
    //       break;
    //     case PlayerState.FREEZING:
    //       videoState.buffering = true;
    //       break;
    //     case PlayerState.SEEKING:
    //       videoState.buffering = true;
    //       break;
    //     case PlayerState.ENDED:
    //       videoState.playing = false;
    //       videoState.buffering = false;
    //       videoEnded();
    //       break;
    //     case PlayerState.RELOADING:
    //       videoState.buffering = true;
    //       break;
    //   }
    // });

    playerInstance?.addEventListener('error', error => {
      console.log('error', error);
      if (error instanceof Error) {
        videoState.playerError = error;
      } else {
        videoState.playerError = new Error('An unknown error occurred');
        console.log('Shaka error', error);
      }
    });

    playerInstance?.addEventListener('segmentappended', () => {
      videoState.bufferLevel = getBufferLevel() || 0;
    });

    playerInstance?.addEventListener('onstatechange', () => {
      videoState.bufferLevel = getBufferLevel() || 0;
    });

    // playerInstance?.addEventListener('volumeChange', volume => {
    //   videoState.volume = volume.volume;
    //   videoState.muted = volume.muted;
    // });

    // playerInstance?.addEventListener('availableVideoTracksChange', videoTracks => {
    //   videoState.videoTracks = mapVideoTracks(videoTracks);
    // });

    // playerInstance?.addEventListener('availableAudioTracksChange', audioTracks => {
    //   videoState.audioTracks = mapAudioTracks(audioTracks);
    // });

    // playerInstance?.addEventListener('videoTrackChange', () => {
    //   refreshTracks();
    // });

    // playerInstance?.addEventListener('audioTrackChange', () => {
    //   refreshTracks();
    // });

    // playerInstance?.addEventListener('videoRepresentationChange', videoRepresentation => {
    //   currentVideoRepresentationId.value = videoRepresentation?.id?.toString();
    //   refreshTracks();
    // });

    // playerInstance?.addEventListener('audioRepresentationChange', audioRepresentation => {
    //   currentAudioRepresentationId.value = audioRepresentation?.id?.toString();
    //   refreshTracks();
    // });
  };

  const getBufferLevel = () => {
    let bufferLevel = 0;
    const bufferedInfo = playerInstance?.getBufferedInfo();
    if (bufferedInfo) {
      bufferLevel = bufferedInfo.total.sort((a, b) => a.end - b.end).reverse()[0].end;
    }
    return bufferLevel;
  };

  const currentVideoRepresentationId = ref<string | null>(null);
  const currentAudioRepresentationId = ref<string | null>(null);

  const refreshTracks = () => {
    // videoState.videoTracks = mapVideoTracks(playerInstance?.getAvailableVideoTracks());
    // videoState.audioTracks = mapAudioTracks(playerInstance?.getAvailableAudioTracks());
    // videoState.languageList = mapLanguageList(playerInstance?.getAvailableAudioTracks());
    // const currentLanguage = playerInstance?.getAudioTrack()?.language;
    // if (currentLanguage) videoState.selectedLanguage = currentLanguage;
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
      .filter(audioTrack => videoState.selectedLanguage === audioTrack.language)
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
          label: track.language,
          active: track.active
        };
      })
      .sort((a, b) => a.language.localeCompare(b.language))
      .filter(
        (language, index, self) => self.findIndex(l => l.language === language.language) === index
      );
  };

  let playerInstance = createPlayer();

  watch(videoElementRef, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      playerInstance?.detach();
      playerInstance?.attach(videoElementRef.value);
      videoElementRef.value.volume = volumeStorage.value;
      loadVideo();
    }
  });

  watch(source, () => {
    loadVideo();
  });

  const loadVideo = () => {
    playerInstance?.load(source.value, startTime?.value || 0);
  };

  const destroy = () => {
    playerInstance?.unload();
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
    if (videoElementRef.value && !isNaN(time)) {
      videoElementRef.value.currentTime = time;
      videoState.currentTime = time;
    }
  };

  const setLanguage = (language: string) => {
    // const trackId = playerInstance
    //   ?.getAvailableAudioTracks()
    //   .find(track => track.language === language)?.id;
    // if (!trackId) return;
    // playerInstance?.setAudioTrack({ trackId, switchingMode: 'direct' });
  };
  const setVideoRepresentation = (videoTrackId: string, videoRepresentationId: string) => {
    // playerInstance?.setVideoTrack({
    //   trackId: videoTrackId,
    //   switchingMode: 'seamless',
    //   lockedRepresentations: [videoRepresentationId]
    // });
    // videoState.automaticVideoQuality = false;
    // refreshTracks();
  };
  const setAutoVideoQuality = () => {
    // playerInstance?.unlockVideoRepresentations();
    // videoState.automaticVideoQuality = true;
  };
  const setAudioRepresentation = (audioTrackId: string, audioRepresentationId: string) => {
    // playerInstance?.setAudioTrack({
    //   trackId: audioTrackId,
    //   switchingMode: 'seamless',
    //   lockedRepresentations: [audioRepresentationId]
    // });
    // videoState.automaticAudioQuality = false;
  };
  const setAutoAudioQuality = () => {
    // playerInstance?.unlockAudioRepresentations();
    // videoState.automaticAudioQuality = true;
  };

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
