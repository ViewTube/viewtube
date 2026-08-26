import type { Level, MediaPlaylist } from 'hls.js';
import { seekOnLoadedMetadata, useElementState } from '../elementState';
import {
  mapLanguageList,
  mapVideoTracks,
  type EngineAudioTrack,
  type EngineVideoTrack
} from '../mappers';
import type { AdapterContext, PlayerAdapter, PlayerSource } from '../types';

const TRACK_REFRESH_DEBOUNCE_MS = 250;
const DEAD_STREAM_ERROR_THRESHOLD = 5;

export const createHlsAdapter = async (ctx: AdapterContext): Promise<PlayerAdapter> => {
  const Hls = await import('hls.js').then(module => module.default);

  const hls = new Hls({
    enableWorker: true,
    backBufferLength: 400,
    maxBufferLength: 90,
    lowLatencyMode: true,
    progressive: true,
    fragLoadPolicy: {
      default: {
        maxTimeToFirstByteMs: 10000,
        maxLoadTimeMs: 120000,
        timeoutRetry: { maxNumRetry: 400, retryDelayMs: 0, maxRetryDelayMs: 0 },
        errorRetry: { maxNumRetry: 400, retryDelayMs: 1000, maxRetryDelayMs: 8000 }
      }
    }
  });
  hls.attachMedia(ctx.videoElementRef.value);

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

  let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  let consecutiveFragErrors = 0;

  /**
   * duration is the adapter's responsibility here: videoEl.duration is Infinity on a live
   * playlist, and the seekbar, the keyboard seeks and mediaSession all need a finite
   * number. liveSyncPosition is that number, and it is null until enough of the playlist
   * has loaded to compute it.
   */
  const updateLivePosition = (isLive: boolean) => {
    ctx.state.live = isLive;

    if (isLive) {
      const edge = hls.liveSyncPosition;
      if (Number.isFinite(edge)) {
        ctx.state.liveEdge = edge;
        ctx.state.duration = edge;
      }
      return;
    }

    // A live stream that ended gets an ENDLIST tag and becomes a plain VOD playlist.
    ctx.state.liveEdge = null;
    const { duration } = ctx.videoElementRef.value ?? {};
    if (Number.isFinite(duration)) ctx.state.duration = duration;
  };

  // hls.js exposes a flat level list rather than tracks, so everything lives on one
  // synthetic track and the level index doubles as the representation id.
  const toEngineVideoTracks = (levels: Level[]): EngineVideoTrack[] => [
    {
      id: '0',
      active: true,
      representations: (levels ?? []).map((level, index) => ({
        id: index.toString(),
        bitrate: level.bitrate,
        codec: level.codecSet,
        width: level.width,
        height: level.height,
        frameRate: level.frameRate,
        hdr: !!level.attrs?.HDR,
        hdrType: level.attrs?.HDR
      }))
    }
  ];

  const toEngineAudioTracks = (tracks: MediaPlaylist[]): EngineAudioTrack[] =>
    (tracks ?? []).map((track, index) => ({
      id: index.toString(),
      active: index === hls.audioTrack,
      language: track.lang ?? track.name,
      label: track.name,
      representations: []
    }));

  const refreshTracks = () => {
    ctx.state.videoTracks = mapVideoTracks(
      toEngineVideoTracks(hls.levels),
      hls.currentLevel >= 0 ? hls.currentLevel.toString() : null
    );

    const audioTracks = toEngineAudioTracks(hls.audioTracks);
    ctx.state.languageList = mapLanguageList(audioTracks);
    const activeLanguage = audioTracks.find(track => track.active)?.language;
    if (activeLanguage) ctx.state.selectedLanguage = activeLanguage;
  };

  const scheduleRefresh = () => {
    if (refreshTimeout) return;
    refreshTimeout = setTimeout(() => {
      refreshTimeout = null;
      refreshTracks();
    }, TRACK_REFRESH_DEBOUNCE_MS);
  };

  hls.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
    updateLivePosition(!!data.details?.live);
    scheduleRefresh();
  });
  hls.on(Hls.Events.LEVEL_UPDATED, () => scheduleRefresh());
  hls.on(Hls.Events.LEVEL_SWITCHED, () => scheduleRefresh());
  hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => scheduleRefresh());
  hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, () => scheduleRefresh());

  hls.on(Hls.Events.FRAG_LOADED, () => {
    consecutiveFragErrors = 0;
    if (ctx.state.live) updateLivePosition(true);
  });

  hls.on(Hls.Events.ERROR, (event, data) => {
    if (data.details === 'fragLoadError') {
      consecutiveFragErrors += 1;
      if (consecutiveFragErrors >= DEAD_STREAM_ERROR_THRESHOLD && ctx.state.live) {
        ctx.state.error = {
          code: 'live-ended',
          message: 'The live stream is no longer available',
          fatal: false
        };
      }
      return;
    }

    if (['fragParsingError', 'bufferStalledError', 'levelLoadError'].includes(data.details)) {
      return;
    }

    ctx.state.error = {
      code: data.details,
      message: data.error?.message ?? 'Video player error',
      fatal: !!data.fatal
    };
    ctx.createMessage({
      type: 'error',
      title: `Video player error: ${data.details}`,
      message: data.error?.message
    });
  });

  ctx.videoElementRef.value.volume = ctx.defaultVolume.value;
  ctx.state.volume = ctx.defaultVolume.value;

  const videoEl = () => ctx.videoElementRef.value;

  // Watching a live stream from behind can be sped up to catch up; drop back to 1x on
  // reaching the edge rather than overshooting it.
  const onTimeUpdate = () => {
    const element = videoEl();
    if (!element || !ctx.state.live) return;
    if (!Number.isFinite(ctx.state.liveEdge)) return;

    if (element.currentTime >= ctx.state.liveEdge - 2 && element.playbackRate > 1) {
      element.playbackRate = 1;
      ctx.state.speed = 1;
    }
  };
  ctx.videoElementRef.value.addEventListener('timeupdate', onTimeUpdate);

  return {
    async load(source: PlayerSource, startTime: number) {
      if (source.kind !== 'hls') {
        throw new Error(`hlsAdapter received a '${source.kind}' source`);
      }

      consecutiveFragErrors = 0;
      hls.loadSource(applyStreamProxy(source.url));
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
    setLanguage: (language: string) => {
      const index = hls.audioTracks?.findIndex(track => (track.lang ?? track.name) === language);
      if (index === undefined || index < 0) return;
      hls.audioTrack = index;
      ctx.state.selectedLanguage = language;
    },
    setVideoQuality: (_trackId: string, representationId: string | null) => {
      hls.currentLevel = representationId === null ? -1 : parseInt(representationId, 10);
      ctx.state.automaticVideoQuality = representationId === null;
      refreshTracks();
    },
    setAudioQuality: () => {},
    destroy: () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = null;
      ctx.videoElementRef.value?.removeEventListener('timeupdate', onTimeUpdate);
      cleanupElementState();
      hls.stopLoad();
      hls.destroy();
    }
  };
};
