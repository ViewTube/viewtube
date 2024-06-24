import { useIsIOS } from '~/composables/videoplayer/isIOS';
import type { RxPlayerAdapterOptions } from './rxPlayerAdapter';

type NativeAdapterOptions = RxPlayerAdapterOptions;

export const nativeAdapter = async ({
  autoplay,
  defaultVolume,
  loop,
  source,
  startTime,
  videoElementRef,
  videoState,
  videoEnded,
  createMessage
}: NativeAdapterOptions) => {
  const { applyStreamProxy } = useProxyUrls();
  const { isIOSOnIPhone } = useIsIOS();

  const registerEvents = () => {
    if (isIOSOnIPhone.value) {
      videoState.buffering = false;
    } else {
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
          if (
            !isNaN(videoElementRef.value?.currentTime) &&
            videoElementRef.value.currentTime >= 0 &&
            videoElementRef.value.currentTime < Infinity
          ) {
            videoState.currentTime = videoElementRef.value?.currentTime;
          }
          if (
            !isNaN(videoElementRef.value?.duration) &&
            videoElementRef.value.duration >= 0 &&
            videoElementRef.value.duration < Infinity
          ) {
            videoState.duration = videoElementRef.value?.duration;
          }
        }
      });
    }
    videoElementRef.value?.addEventListener('volumechange', () => {
      videoState.volume = videoElementRef.value.volume;
      videoState.muted = videoElementRef.value.muted;
    });

    videoElementRef.value?.addEventListener('error', event => {
      console.log(event, event.error);
      videoState.playerError = {
        message: 'Video player error',
        name: 'error'
      };
      createMessage({
        type: 'error',
        title: 'Video player error',
        message: 'There was an error playing the video'
      });
    });
  };

  const destroy = () => {
    videoElementRef.value?.pause();
  };
  const play = () => videoElementRef.value?.play();
  const pause = () => videoElementRef.value?.pause();
  const stop = () => {
    videoElementRef.value?.pause();
  };
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
  const setVideoRepresentation = (_videoTrackId: string, _videoRepresentationId: string) => {};
  const setAutoVideoQuality = () => {};
  const setAudioRepresentation = (_audioTrackId: string, _audioRepresentationId: string) => {};
  const setAutoAudioQuality = () => {};

  registerEvents();
  videoElementRef.value.volume = defaultVolume.value;
  const sourceElement = document.createElement('source');
  sourceElement.src = applyStreamProxy(source.value);
  sourceElement.type = 'application/vnd.apple.mpegurl';
  videoElementRef.value.appendChild(sourceElement);
  videoElementRef.value.currentTime = startTime.value;
  videoElementRef.value.loop = loop;

  // videoState.buffering = false;

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
