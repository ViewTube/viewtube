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
  stop,
  setTime,
  onNextTrack
}: MediaSessionProps) => {
  const { proxyUrl } = useImgProxy();

  if (navigator && 'mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: video.title,
      artist: video.author?.name,
      artwork: video.thumbnails?.map(thumbnail => {
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
        navigator.mediaSession.playbackState = newValue ? 'playing' : 'paused';
      }
    );

    watch(
      () => videoState.currentTime,
      () => {
        // The spec rejects the whole call if position exceeds duration, and seekMax
        // legitimately trails currentTime — it is 0 until the adapter reports a duration,
        // and on live it tracks an edge the playhead can round past. Clamping keeps the
        // position honest instead of throwing on short or live videos.
        const duration = videoState.seekMax;
        if (!(duration > 0)) return;

        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: videoState.speed > 0 ? videoState.speed : 1,
          position: Math.min(Math.max(videoState.currentTime, 0), duration)
        });
      }
    );
  }
};
