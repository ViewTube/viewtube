import type { useSettingsStore } from '@/store/settings';
import RxPlayer from 'rx-player';
import type { IAvailableAudioTrack, IAvailableVideoTrack } from 'rx-player/types';
import type { AudioTrack, Language, VideoTrack } from '~/interfaces/VideoState';

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
          break;
        case PlayerState.RELOADING:
          videoState.buffering = true;
          break;
      }
    });

    playerInstance?.addEventListener('error', error => {
      console.log('error', error);
      videoState.playerError = error;
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
      playerInstance?.stop();
      playerInstance?.dispose();

      playerInstance = createPlayer();
      registerEvents();
      playerInstance.setVolume(volumeStorage.value);
      loadVideo();
    }
  });

  watch(source, () => {
    loadVideo();
  });

  const loadVideo = () => {
    playerInstance?.loadVideo({
      transport: 'dash',
      url: source.value,
      startAt: {
        position: startTime?.value || 0
      },
      autoPlay: settingsStore.autoplay
    });
  };

  const destroy = () => {
    playerInstance?.stop();
    playerInstance?.dispose();
  };
  const play = () => playerInstance?.play();
  const pause = () => playerInstance?.pause();
  const setVolume = (volume: number) => playerInstance?.setVolume(volume);
  const setPlaybackRate = (playbackRate: number) => playerInstance?.setPlaybackRate(playbackRate);
  const setTime = (time: number) => playerInstance?.seekTo(time);

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
