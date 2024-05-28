import Hls from 'hls.js';
import type { IAvailableAudioTrack, IAvailableVideoTrack } from 'rx-player/types';
import type { AudioTrack, Language, VideoTrack } from '~/interfaces/VideoState';
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

export const hlsAdapter = ({
  videoElementRef,
  source,
  startTime,
  videoState,
  volumeStorage,
  videoEnded,
  createMessage,
  autoplay
}: HlsAdapterOptions) => {
  const { streamProxy } = useProxyUrls();

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

    videoElementRef.value?.addEventListener('timeupdate', () => {
      console.log(playerInstance?.liveSyncPosition);
      videoState.currentTime = videoElementRef.value.currentTime;
      videoState.duration = videoElementRef.value.duration;
    });
    videoElementRef.value?.addEventListener('volumechange', () => {
      videoState.volume = videoElementRef.value.volume;
      videoState.muted = videoElementRef.value.muted;
    });

    playerInstance?.on(Hls.Events.ERROR, (event, data) => {
      console.log('error', event, data);
      videoState.playerError = {
        message: data.details,
        name: data.type
      };
    });
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
      playerInstance?.detachMedia();

      playerInstance?.attachMedia(newValue);

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
    videoState.automaticVideoQuality = false;
    refreshTracks();
  };
  const setAutoVideoQuality = () => {
    // playerInstance?.unlockVideoRepresentations();
    videoState.automaticVideoQuality = true;
  };
  const setAudioRepresentation = (audioTrackId: string, audioRepresentationId: string) => {
    // playerInstance?.setAudioTrack({
    //   trackId: audioTrackId,
    //   switchingMode: 'seamless',
    //   lockedRepresentations: [audioRepresentationId]
    // });
    videoState.automaticAudioQuality = false;
  };
  const setAutoAudioQuality = () => {
    // playerInstance?.unlockAudioRepresentations();
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
