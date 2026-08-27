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

  // Without this the SABR path ignores the user's max-quality setting entirely; every
  // other adapter honours it. Shaka applies the cap to ABR and to manual selection alike.
  const maxHeight = parseInt(ctx.maximumQuality?.replace('p', '') ?? '', 10);

  player.configure({
    abr: { enabled: true },
    ...(Number.isFinite(maxHeight) ? { restrictions: { maxHeight } } : {}),
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

  // Already rewritten to our proxy by videoSource; strip the query to get the bare
  // endpoint the player adapter needs for redirected requests.
  const proxyEndpoint = (() => {
    const url = new URL(initialSource.sabr.streamingUrl, window.location.origin);
    return `${url.origin}${url.pathname}`;
  })();

  const sabr = new SabrStreamingAdapter({
    playerAdapter: new ShakaSabrPlayerAdapter(proxyEndpoint),
    clientInfo: initialSource.sabr.clientInfo
  });

  // No onMintPoToken: the SABR endpoint does not validate the token on this path
  // (scripts/sabr-probe's `npm run spike` verifies it — a request with no token at all
  // still returns media), so BotGuard is kept out of the client entirely.

  const applySource = (source: SabrPlayerSource) => {
    sabr.setStreamingURL(source.sabr.streamingUrl);
    sabr.setUstreamerConfig(source.sabr.ustreamerConfig);
    sabr.setServerAbrFormats(source.sabr.formats as SabrFormat[]);
  };

  const reloadSession = async () => {
    if (!ctx.refreshSource) return;

    try {
      const refreshed = await ctx.refreshSource();
      if (refreshed?.kind === 'sabr') applySource(refreshed);
    } catch {
      // Leave the current session in place; the retry either succeeds anyway or surfaces
      // as a normal playback error.
    }
  };

  // The streaming URL and ustreamer config expire on their own clock (~6h), and YouTube
  // signals that by asking for a reload rather than by failing. googlevideo awaits this
  // callback and then retries the same segment request, so swapping the session in place
  // keeps playback going — reloading Shaka here would rebuffer and lose the position.
  sabr.onReloadPlayerResponse(reloadSession);

  // Only YouTube can trigger a real reload, and it does so after hours of playback, so
  // this path has no other way to be exercised. The seam is compiled out of production
  // builds; `scripts/sabr-probe/reload-probe.mjs` drives it.
  if (import.meta.dev) {
    (window as Window & { __vtSabrReload?: () => Promise<void> }).__vtSabrReload = reloadSession;
  }

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

      // Grouped by codec *family*, not by the full codec string. YouTube hands out a
      // separate profile per resolution (`av01.0.12M.08`, `av01.0.08M.08`, …) — twelve
      // strings across three families for a 4K video — and QualitySelector picks the
      // first track whose family matches, so keying on the full string hides every
      // resolution outside that one track.
      const codec = (variant.videoCodec ?? '').split('.')[0];
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

  /**
   * A Shaka variant is an (audio, video) pair, so selecting one by a single side would
   * drag along whatever the other side happens to be — picking an audio bitrate would
   * silently reset the video quality the viewer just chose, and vice versa. Prefer the
   * variant that keeps the current other side, and only fall back when that pairing does
   * not exist.
   */
  const findVariant = ({ videoId, audioId }: { videoId?: string; audioId?: string }) => {
    const variants = player.getVariantTracks();
    const active = variants.find(track => track.active);

    const matches = variants.filter(track =>
      videoId ? track.originalVideoId === videoId : track.originalAudioId === audioId
    );

    const keepOther = videoId
      ? matches.find(track => track.originalAudioId === active?.originalAudioId)
      : matches.find(track => track.originalVideoId === active?.originalVideoId);

    return keepOther ?? matches[0];
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
        const variant = findVariant({ videoId: representationId });
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
        const variant = findVariant({ audioId: representationId });
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
