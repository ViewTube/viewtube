import { SabrStreamingAdapter } from 'googlevideo/sabr-streaming-adapter';
import type { SabrFormat } from 'googlevideo/shared-types';
import shaka from 'shaka-player/dist/shaka-player.compiled';
import { useElementState } from '../elementState';
import {
  mapAudioTracks,
  mapLanguageList,
  mapVideoTracks,
  type EngineAudioTrack,
  type EngineVideoTrack
} from '../mappers';
import type { AdapterContext, PlayerAdapter, PlayerSource } from '../types';

/**
 * Plays VOD through YouTube's SABR protocol.
 *
 * Shaka drives segment timing from a DASH manifest whose BaseURLs are `sabr://`
 * pseudo-URLs; googlevideo's streaming adapter intercepts those and turns each one into a
 * protobuf POST, which our server proxies. Shaka is confined to this file — the rest of
 * ViewTube only sees the PlayerAdapter interface.
 */
type SabrPlayerSource = Extract<PlayerSource, { kind: 'sabr' }>;

type ShakaErrorDetail = {
  code?: number;
  severity?: number;
  data?: unknown[];
};

/** Shaka's compiled build reports errors as bare numbers; turn them into something a viewer can act on. */
const describeShakaError = (detail?: ShakaErrorDetail): string => {
  const httpStatus = findHttpStatus(detail);

  if (httpStatus === 403) {
    return 'YouTube refused this playback request. Streaming through the SABR protocol is not working yet.';
  }
  if (httpStatus) {
    return `YouTube returned HTTP ${httpStatus} while loading the video.`;
  }
  if (detail?.code === 1001 || detail?.code === 1002) {
    return 'The video stream could not be loaded.';
  }
  return `The video could not be played (player error ${detail?.code ?? 'unknown'}).`;
};

/** The useful status is nested inside the error's data, sometimes another error deep. */
const findHttpStatus = (detail?: ShakaErrorDetail, depth = 0): number | undefined => {
  if (!detail || depth > 3) return undefined;

  for (const entry of detail.data ?? []) {
    if (typeof entry === 'number' && entry >= 100 && entry < 600) return entry;
    if (entry && typeof entry === 'object') {
      const nested = findHttpStatus(entry as ShakaErrorDetail, depth + 1);
      if (nested) return nested;
    }
  }
  return undefined;
};

export const createSabrAdapter = async (
  ctx: AdapterContext,
  initialSource: PlayerSource
): Promise<PlayerAdapter> => {
  if (initialSource.kind !== 'sabr') {
    throw new Error(`sabrAdapter received a '${initialSource.kind}' source`);
  }
  const { ShakaSabrPlayerAdapter } = await import('./sabrPlayerAdapter');

  shaka.polyfill.installAll();

  const player = new shaka.Player();
  await player.attach(ctx.videoElementRef.value);

  player.configure({
    abr: { enabled: true },
    streaming: {
      bufferingGoal: 120,
      rebufferingGoal: 2
    },
    manifest: {
      // Thumbnail tracks are large in these manifests and ViewTube renders its own
      // preview strip from the DTO instead.
      disableThumbnails: true
    }
  });

  const sabr = new SabrStreamingAdapter({
    playerAdapter: new ShakaSabrPlayerAdapter(),
    clientInfo: initialSource.sabr.clientInfo
  });

  // No onMintPoToken: the SABR endpoint does not validate the token on this path
  // (scripts/sabr-probe verifies it — removing or corrupting it still returns media),
  // so BotGuard is kept out of the client entirely.

  sabr.attach(player);

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

  const toEngineVideoTracks = (): EngineVideoTrack[] => {
    const variants = player.getVariantTracks();
    const activeVideoId = variants.find(variant => variant.active)?.originalVideoId;
    const byCodec = new Map<string, EngineVideoTrack>();

    for (const variant of variants) {
      if (!variant.originalVideoId) continue;

      const codec = variant.videoCodec ?? '';
      const track = byCodec.get(codec) ?? {
        id: codec || 'video',
        active: false,
        representations: []
      };

      if (!track.representations.some(rep => rep.id === variant.originalVideoId)) {
        track.representations.push({
          id: variant.originalVideoId,
          bitrate: variant.videoBandwidth ?? variant.bandwidth,
          codec,
          width: variant.width ?? 0,
          height: variant.height ?? 0,
          frameRate: variant.frameRate ?? 0,
          hdr: variant.hdr === 'PQ' || variant.hdr === 'HLG',
          hdrType: variant.hdr ?? undefined
        });
      }
      if (variant.originalVideoId === activeVideoId) track.active = true;
      byCodec.set(codec, track);
    }

    for (const track of byCodec.values()) {
      track.representations.sort((a, b) => a.bitrate - b.bitrate);
    }
    return [...byCodec.values()];
  };

  const toEngineAudioTracks = (): EngineAudioTrack[] => {
    const variants = player.getVariantTracks();
    const byLanguage = new Map<string, EngineAudioTrack>();

    for (const variant of variants) {
      if (!variant.originalAudioId) continue;
      const language = variant.language || 'und';
      const track = byLanguage.get(language) ?? {
        id: language,
        active: false,
        language,
        label: variant.label || language,
        representations: []
      };
      if (!track.representations.some(rep => rep.id === variant.originalAudioId)) {
        track.representations.push({
          id: variant.originalAudioId,
          bitrate: variant.audioBandwidth ?? variant.bandwidth,
          codec: variant.audioCodec ?? ''
        });
      }
      if (variant.active) track.active = true;
      byLanguage.set(language, track);
    }

    return [...byLanguage.values()];
  };

  const refreshTracks = () => {
    const active = player.getVariantTracks().find(variant => variant.active);

    ctx.state.videoTracks = mapVideoTracks(toEngineVideoTracks(), active?.originalVideoId ?? null);

    const audioTracks = toEngineAudioTracks();
    ctx.state.languageList = mapLanguageList(audioTracks);
    if (active?.language) ctx.state.selectedLanguage = active.language;
    ctx.state.audioTracks = mapAudioTracks(
      audioTracks,
      active?.originalAudioId ?? null,
      ctx.state.selectedLanguage
    );
  };

  player.addEventListener('trackschanged', refreshTracks);
  player.addEventListener('variantchanged', refreshTracks);
  player.addEventListener('adaptation', refreshTracks);

  player.addEventListener('error', event => {
    const detail = (event as unknown as { detail?: ShakaErrorDetail }).detail;
    const message = describeShakaError(detail);

    // Shaka keeps retrying recoverable errors on its own; only a critical one means
    // playback has actually stopped.
    const fatal = detail?.severity !== 1;

    ctx.state.error = { code: `shaka-${detail?.code ?? 'unknown'}`, message, fatal };
    if (fatal) ctx.state.buffering = false;

    ctx.createMessage({ type: 'error', title: 'Video playback error', message });
  });

  player.addEventListener('buffering', event => {
    ctx.state.buffering = !!(event as unknown as { buffering?: boolean }).buffering;
  });

  ctx.videoElementRef.value.volume = ctx.defaultVolume.value;
  ctx.state.volume = ctx.defaultVolume.value;
  ctx.state.live = false;
  ctx.state.liveEdge = null;

  const videoEl = () => ctx.videoElementRef.value;

  const applySource = (source: SabrPlayerSource) => {
    sabr.setStreamingURL(source.sabr.streamingUrl);
    sabr.setUstreamerConfig(source.sabr.ustreamerConfig);
    sabr.setServerAbrFormats(source.sabr.formats as SabrFormat[]);
  };

  return {
    async load(source: PlayerSource, startTime: number) {
      if (source.kind !== 'sabr') {
        throw new Error(`sabrAdapter received a '${source.kind}' source`);
      }

      applySource(source);

      try {
        await player.load(source.manifest, startTime || undefined);
      } catch (error) {
        // player.load() rejects rather than firing an 'error' event, so the overlay only
        // appears if the rejection is translated here.
        const detail = error as ShakaErrorDetail;
        const message = describeShakaError(detail);
        ctx.state.error = { code: `shaka-${detail?.code ?? 'load'}`, message, fatal: true };
        ctx.state.buffering = false;
        ctx.createMessage({ type: 'error', title: 'Video playback error', message });
        throw error;
      }

      if (Number.isFinite(videoEl()?.duration)) ctx.state.duration = videoEl().duration;
      videoEl().loop = ctx.loop;
      ctx.state.loop = ctx.loop;
      refreshTracks();
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
      const audioTrack = player.getAudioTracks().find(track => track.language === language);
      if (!audioTrack) return;

      player.selectAudioTrack(audioTrack);
      ctx.state.selectedLanguage = language;
      refreshTracks();
    },
    setVideoQuality: (_trackId: string, representationId: string | null) => {
      // The server picks the actual quality, so a manual choice is a preference: pin the
      // matching variant and let ABR resume when it is cleared.
      if (representationId === null) {
        player.configure({ abr: { enabled: true } });
        ctx.state.automaticVideoQuality = true;
      } else {
        const variant = player
          .getVariantTracks()
          .find(track => track.originalVideoId === representationId);
        if (variant) {
          player.configure({ abr: { enabled: false } });
          player.selectVariantTrack(variant, true);
          ctx.state.automaticVideoQuality = false;
        }
      }
      refreshTracks();
    },
    setAudioQuality: (_trackId: string, representationId: string | null) => {
      if (representationId === null) {
        player.configure({ abr: { enabled: true } });
        ctx.state.automaticAudioQuality = true;
      } else {
        const variant = player
          .getVariantTracks()
          .find(track => track.originalAudioId === representationId);
        if (variant) {
          player.configure({ abr: { enabled: false } });
          player.selectVariantTrack(variant, true);
          ctx.state.automaticAudioQuality = false;
        }
      }
      refreshTracks();
    },
    destroy: () => {
      cleanupElementState();
      sabr.dispose();
      player.destroy();
    }
  };
};
