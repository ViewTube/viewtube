import type { ApiDto } from '@viewtube/shared';

type MediaSessionProps = {
  video: ApiDto<'VTVideoInfoDto'>;
  videoState: VideoState['video'];
  play: VideoState['play'];
  pause: VideoState['pause'];
  stop: VideoState['stop'];
  setTime: VideoState['setTime'];
  onNextTrack: () => void;
};

export const useMediaSession = ({
  video,
  videoState,
  play,
  pause,
  setTime,
  onNextTrack
}: MediaSessionProps) => {
  const { proxyUrl } = useImgProxy();

  if (navigator && 'mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: video.title,
      artist: video.author.name,
      artwork: video.thumbnails.map(thumbnail => {
        return {
          src: proxyUrl(thumbnail.url),
          sizes: `${thumbnail.width}x${thumbnail.height}`,
          type: 'image/png'
        };
      })
    });

    navigator.mediaSession.setActionHandler('play', () => {
      play();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      pause();
    });

    navigator.mediaSession.setActionHandler('stop', () => {
      stop();
    });

    navigator.mediaSession.setActionHandler('seekbackward', () => {
      setTime(videoState.currentTime - 10);
    });

    navigator.mediaSession.setActionHandler('seekforward', () => {
      setTime(videoState.currentTime + 10);
    });

    navigator.mediaSession.setActionHandler('seekto', details => {
      setTime(details.seekTime);
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      setTime(0);
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      onNextTrack();
    });

    watch(
      () => videoState.playing,
      newValue => {
        if (newValue) {
          navigator.mediaSession.playbackState = 'playing';
        } else {
          navigator.mediaSession.playbackState = 'paused';
        }
      }
    );

    watch(
      () => videoState.currentTime,
      () => {
        navigator.mediaSession.setPositionState({
          duration: videoState.duration,
          playbackRate: videoState.speed,
          position: videoState.currentTime
        });
      }
    );
  }
};
