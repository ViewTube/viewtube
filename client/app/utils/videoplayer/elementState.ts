import type { PlayerState } from './types';

type ElementStateOptions = {
  onEnded: () => void;
  autoplay?: boolean;
  onAutoplayBlocked?: () => void;
};

/**
 * Wires the `HTMLMediaElement` events that behave identically for every adapter.
 *
 * `bufferLevel` is a *delta*: seconds buffered ahead of the playhead, taken from the
 * range containing `currentTime`. Using the last range instead would overstate the
 * buffer after seeking across a gap.
 *
 * `duration` is deliberately not written here. `videoEl.duration` is `Infinity` on live
 * playlists, and several consumers (mediaSession's setPositionState, the keyboard seeks,
 * chapter positions) break on a non-finite duration. Each adapter owns `duration`,
 * `live` and `liveEdge`, because only the adapter knows whether its source is live.
 *
 * Returns a cleanup function that removes every listener it registered.
 */
export const useElementState = (
  videoEl: HTMLVideoElement,
  state: PlayerState,
  { onEnded, autoplay, onAutoplayBlocked }: ElementStateOptions
): (() => void) => {
  const listeners: Array<[string, EventListener]> = [];

  const on = (event: string, listener: EventListener) => {
    videoEl.addEventListener(event, listener);
    listeners.push([event, listener]);
  };

  on('canplay', () => {
    state.buffering = false;
  });
  on('playing', () => {
    state.playing = true;
    state.buffering = false;
  });
  on('pause', () => {
    state.playing = false;
    state.buffering = false;
  });
  on('waiting', () => {
    state.buffering = true;
  });
  on('ended', () => {
    state.playing = false;
    state.buffering = false;
    onEnded();
  });

  on('timeupdate', () => {
    state.currentTime = videoEl.currentTime;
    state.bufferLevel = getBufferAhead(videoEl);
  });

  on('volumechange', () => {
    state.volume = videoEl.volume;
    state.muted = videoEl.muted;
  });

  on('error', () => {
    state.error = {
      code: 'element',
      message: videoEl.error?.message || 'There was an error playing the video',
      fatal: true
    };
  });

  if (autoplay) {
    // Once only: `canplay` fires again after every seek and buffer stall, and resuming
    // playback there would override a deliberate pause.
    const tryAutoplay = () => {
      videoEl.removeEventListener('canplay', tryAutoplay);
      videoEl.play().catch(() => onAutoplayBlocked?.());
    };
    on('canplay', tryAutoplay);
  }

  return () => {
    listeners.forEach(([event, listener]) => videoEl.removeEventListener(event, listener));
    listeners.length = 0;
  };
};

const getBufferAhead = (videoEl: HTMLVideoElement): number => {
  const { buffered, currentTime } = videoEl;

  for (let i = 0; i < buffered.length; i++) {
    if (buffered.start(i) <= currentTime && buffered.end(i) >= currentTime) {
      return Math.max(0, buffered.end(i) - currentTime);
    }
  }
  return 0;
};

/**
 * Seeking before metadata is available is silently dropped by the element, which is how
 * the resume position gets lost on the native and hls paths.
 */
export const seekOnLoadedMetadata = (videoEl: HTMLVideoElement, time: number) => {
  if (!time) return;

  if (videoEl.readyState >= HTMLMediaElement.HAVE_METADATA) {
    videoEl.currentTime = time;
    return;
  }
  videoEl.addEventListener(
    'loadedmetadata',
    () => {
      videoEl.currentTime = time;
    },
    { once: true }
  );
};
