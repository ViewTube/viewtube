import { seekOnLoadedMetadata, useElementState } from '../elementState';
import type { AdapterContext, PlayerAdapter, PlayerSource } from '../types';

export const createNativeAdapter = async (ctx: AdapterContext): Promise<PlayerAdapter> => {
  const { applyStreamProxy } = useProxyUrls();

  const cleanupElementState = useElementState(ctx.videoElementRef.value, ctx.state, {
    onEnded: ctx.onEnded,
    autoplay: ctx.autoplay,
    onAutoplayBlocked: () =>
      ctx.createMessage({
        type: 'error',
        title: 'Autoplay blocked',
        message: 'Allow autoplay for this website to start the video automatically'
      })
  });

  // useElementState leaves duration to the adapter because it is Infinity on live
  // playlists, which is what the native path is used for. Only finite values are kept.
  const onTimeUpdate = () => {
    const element = ctx.videoElementRef.value;
    if (!element) return;

    if (Number.isFinite(element.duration) && element.duration >= 0) {
      ctx.state.duration = element.duration;
      ctx.state.live = false;
      ctx.state.liveEdge = null;
      return;
    }

    // A live playlist reports an infinite duration; the seekable end is the live edge.
    // end() throws if queried with no ranges buffered yet.
    const seekable = element.seekable;
    if (!seekable || seekable.length === 0) return;

    const edge = seekable.end(seekable.length - 1);
    if (!Number.isFinite(edge)) return;

    ctx.state.live = true;
    ctx.state.liveEdge = edge;
    ctx.state.duration = edge;
  };
  ctx.videoElementRef.value.addEventListener('timeupdate', onTimeUpdate);

  ctx.videoElementRef.value.volume = ctx.defaultVolume.value;
  ctx.state.volume = ctx.defaultVolume.value;

  const videoEl = () => ctx.videoElementRef.value;

  return {
    async load(source: PlayerSource, startTime: number) {
      if (source.kind !== 'native') {
        throw new Error(`nativeAdapter received a '${source.kind}' source`);
      }

      const sourceElement = document.createElement('source');
      sourceElement.src = applyStreamProxy(source.url);
      sourceElement.type = 'application/vnd.apple.mpegurl';
      videoEl().appendChild(sourceElement);
      videoEl().loop = ctx.loop;
      ctx.state.loop = ctx.loop;

      seekOnLoadedMetadata(videoEl(), startTime);
    },
    play: () => void videoEl()?.play(),
    pause: () => videoEl()?.pause(),
    stop: () => videoEl()?.pause(),
    seekTo: (time: number) => {
      if (videoEl()) videoEl().currentTime = time;
    },
    setVolume: (volume: number) => {
      if (!videoEl()) return;
      videoEl().volume = volume;
      ctx.state.volume = volume;
    },
    setMuted: (muted: boolean) => {
      if (!videoEl()) return;
      videoEl().muted = muted;
      ctx.state.muted = muted;
    },
    setPlaybackRate: (rate: number) => {
      if (!videoEl()) return;
      videoEl().playbackRate = rate;
      ctx.state.speed = rate;
    },
    setLanguage: () => {},
    setVideoQuality: () => {},
    destroy: () => {
      const element = videoEl();
      cleanupElementState();
      if (!element) return;

      element.removeEventListener('timeupdate', onTimeUpdate);
      element.pause();
      element.querySelectorAll('source').forEach(sourceElement => sourceElement.remove());
      element.removeAttribute('src');
      element.load();
    }
  };
};
