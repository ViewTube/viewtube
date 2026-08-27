import type { IAvailableAudioTrack, IAvailableVideoTrack } from 'rx-player/types';
import {
  mapLanguageList,
  mapVideoTracks,
  type EngineAudioTrack,
  type EngineVideoTrack
} from '../mappers';
import type { AdapterContext, PlayerAdapter, PlayerSource } from '../types';

enum RxPlayerState {
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

export const createDashAdapter = async (ctx: AdapterContext): Promise<PlayerAdapter> => {
  const RxPlayer = await import('rx-player/minimal').then(module => module.default);
  const { DASH, DASH_WASM } = await import('rx-player/features');
  const { EMBEDDED_DASH_WASM, EMBEDDED_WORKER } =
    await import('rx-player/experimental/features/embeds');

  try {
    RxPlayer.addFeatures([DASH]);
    await DASH_WASM.initialize({ wasmUrl: EMBEDDED_DASH_WASM }).catch(() => {});
  } catch {
    // The JS parser is the fallback; nothing to do.
  }

  const player = new RxPlayer({ videoElement: ctx.videoElementRef.value });
  try {
    await player.attachWorker({ workerUrl: EMBEDDED_WORKER, dashWasmUrl: EMBEDDED_DASH_WASM });
  } catch {
    // Worker-less playback still works, just on the main thread.
  }

  let hasContent = false;
  let capApplied = false;
  let currentVideoRepresentationId: string | null = null;

  const toEngineVideoTracks = (tracks: IAvailableVideoTrack[]): EngineVideoTrack[] =>
    (tracks ?? []).map(track => ({
      id: track.id,
      active: track.active,
      representations: (track.representations ?? []).map(representation => ({
        id: representation.id?.toString(),
        bitrate: representation.bitrate,
        codec: representation.codec,
        width: representation.width,
        height: representation.height,
        frameRate: representation.frameRate,
        hdr: !!representation.hdrInfo,
        hdrType: representation.hdrInfo?.eotf
      }))
    }));

  const toEngineAudioTracks = (tracks: IAvailableAudioTrack[]): EngineAudioTrack[] =>
    (tracks ?? []).map(track => ({
      id: track.id,
      active: track.active,
      language: track.language,
      label: track.label
    }));

  const refreshTracks = () => {
    const audioTracks = toEngineAudioTracks(player.getAvailableAudioTracks());

    ctx.state.videoTracks = mapVideoTracks(
      toEngineVideoTracks(player.getAvailableVideoTracks()),
      currentVideoRepresentationId
    );
    ctx.state.languageList = mapLanguageList(audioTracks);

    const currentLanguage = player.getAudioTrack()?.language;
    if (currentLanguage) ctx.state.selectedLanguage = currentLanguage;
  };

  /**
   * Caps the automatic quality ladder at the user's configured maximum. Only ever called
   * on the auto path: lockVideoRepresentations replaces the locked set, so running it
   * after a manual pick would silently revert that pick to auto-within-cap.
   */
  const applyQualityCap = () => {
    if (!hasContent) return;

    const maxHeight = parseInt(ctx.maximumQuality?.replace('p', '') ?? '', 10);
    if (!Number.isFinite(maxHeight)) return;

    const currentTrack = player.getVideoTrack();
    if (!currentTrack) return;

    const allowed = currentTrack.representations
      .filter(representation => representation.height <= maxHeight)
      .map(representation => representation.id);

    if (allowed.length > 0) player.lockVideoRepresentations(allowed);
  };

  player.addEventListener('playerStateChange', playerState => {
    switch (playerState) {
      case RxPlayerState.STOPPED:
        ctx.state.playing = false;
        ctx.state.buffering = false;
        break;
      case RxPlayerState.LOADING:
      case RxPlayerState.BUFFERING:
      case RxPlayerState.FREEZING:
      case RxPlayerState.SEEKING:
      case RxPlayerState.RELOADING:
        ctx.state.buffering = true;
        break;
      case RxPlayerState.LOADED:
        ctx.state.buffering = false;
        if (!capApplied) {
          applyQualityCap();
          capApplied = true;
        }
        break;
      case RxPlayerState.PLAYING:
        ctx.state.playing = true;
        ctx.state.buffering = false;
        break;
      case RxPlayerState.PAUSED:
        ctx.state.playing = false;
        ctx.state.buffering = false;
        break;
      case RxPlayerState.ENDED:
        ctx.state.playing = false;
        ctx.state.buffering = false;
        ctx.onEnded();
        break;
    }
  });

  player.addEventListener('error', error => {
    ctx.state.error = {
      code: 'playback',
      message: error?.message ?? 'Video playback error',
      fatal: true
    };
    ctx.createMessage({
      type: 'error',
      title: 'Video playback error',
      message: error?.message
    });
  });

  player.addEventListener('warning', warning => {
    if (warning?.message?.includes('MEDIA_ERR_BLOCKED_AUTOPLAY')) {
      ctx.createMessage({
        type: 'error',
        title: 'Autoplay blocked',
        message: 'Allow autoplay for this website to start the video automatically'
      });
    }
  });

  player.addEventListener('positionUpdate', position => {
    ctx.state.currentTime = position.position;
    // bufferGap is already the delta ahead of the playhead, which is what bufferLevel is.
    ctx.state.bufferLevel = Math.max(0, position.bufferGap ?? 0);
    ctx.state.speed = position.playbackRate;
    if (Number.isFinite(position.duration)) ctx.state.duration = position.duration;
  });

  player.addEventListener('volumeChange', volume => {
    ctx.state.volume = volume.volume;
    ctx.state.muted = volume.muted;
  });

  player.addEventListener('availableVideoTracksChange', () => refreshTracks());
  player.addEventListener('availableAudioTracksChange', () => refreshTracks());
  player.addEventListener('videoTrackChange', () => refreshTracks());
  player.addEventListener('audioTrackChange', () => refreshTracks());
  player.addEventListener('videoRepresentationChange', representation => {
    currentVideoRepresentationId = representation?.id?.toString() ?? null;
    refreshTracks();
  });
  player.addEventListener('audioRepresentationChange', () => refreshTracks());

  player.setVolume(ctx.defaultVolume.value);
  ctx.state.volume = ctx.defaultVolume.value;
  ctx.state.live = false;
  ctx.state.liveEdge = null;

  return {
    async load(source: PlayerSource, startTime: number) {
      if (source.kind !== 'dash') {
        throw new Error(`dashAdapter received a '${source.kind}' source`);
      }

      capApplied = false;
      player.loadVideo({
        transport: 'dash',
        url: source.manifest,
        startAt: { position: startTime },
        autoPlay: ctx.autoplay,
        requestConfig: {
          segment: { maxRetry: 5 }
        }
      });
      hasContent = true;

      if (ctx.videoElementRef.value) {
        ctx.videoElementRef.value.loop = ctx.loop;
        ctx.state.loop = ctx.loop;
      }
    },
    play: () => player.play(),
    pause: () => player.pause(),
    stop: () => player.pause(),
    seekTo: (time: number) => player.seekTo(time),
    setVolume: (volume: number) => player.setVolume(volume),
    setMuted: (muted: boolean) => {
      if (!ctx.videoElementRef.value) return;
      ctx.videoElementRef.value.muted = muted;
      ctx.state.muted = muted;
    },
    setPlaybackRate: (rate: number) => player.setPlaybackRate(rate),
    setLanguage: (language: string) => {
      if (!hasContent) return;
      const trackId = player
        .getAvailableAudioTracks()
        .find(track => track.language === language)?.id;
      if (!trackId) return;

      player.setAudioTrack({ trackId, switchingMode: 'direct' });
    },
    setVideoQuality: (trackId: string, representationId: string | null) => {
      // setVideoTrack takes lockedRepresentations directly, so the track switch and the
      // quality lock are one operation rather than an unlock followed by a re-lock.
      if (!hasContent) return;

      player.setVideoTrack({
        trackId,
        switchingMode: 'seamless',
        lockedRepresentations: representationId ? [representationId] : null
      });
      ctx.state.automaticVideoQuality = representationId === null;

      if (representationId === null) applyQualityCap();
      refreshTracks();
    },
    destroy: () => {
      hasContent = false;
      player.stop();
      player.dispose();
    }
  };
};
