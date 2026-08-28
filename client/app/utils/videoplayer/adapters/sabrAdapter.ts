import { SabrStreamingAdapter } from 'googlevideo/sabr-streaming-adapter';
import type { SabrFormat } from 'googlevideo/shared-types';
import shaka from 'shaka-player/dist/shaka-player.compiled';
import { useElementState } from '../elementState';
import { normalizeHeight } from '../format';
import {
  mapLanguageList,
  mapVideoTracks,
  type EngineAudioTrack,
  type EngineVideoRepresentation
} from '../mappers';
import type { AdapterContext, PlayerAdapter, PlayerSource } from '../types';
import { SABR_ATTESTATION_REQUIRED, SABR_NO_MEDIA } from './sabrPlayerAdapter';

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

  if (carriesMarker(detail, SABR_ATTESTATION_REQUIRED)) {
    return 'YouTube stopped sending this video partway through because it wants proof the player is a real browser, which this server cannot currently provide. Other videos are unaffected.';
  }
  if (isNoMedia(detail)) {
    return 'YouTube stopped sending this video’s stream. Reloading the page usually helps.';
  }
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

/** `recoverableError` in sabrPlayerAdapter puts its message first in the error's data. */
const isNoMedia = (detail?: ShakaErrorDetail): boolean => carriesMarker(detail, SABR_NO_MEDIA);

/**
 * Shaka gives up on a segment by raising a *new* fatal error that carries the last
 * recoverable one inside its data, so the marker is not always at the top level by the
 * time the viewer's error is raised.
 */
const carriesMarker = (
  detail: ShakaErrorDetail | undefined,
  marker: string,
  depth = 0
): boolean => {
  if (!detail || depth > 3) return false;

  for (const entry of detail.data ?? []) {
    if (entry === marker) return true;
    if (
      entry &&
      typeof entry === 'object' &&
      carriesMarker(entry as ShakaErrorDetail, marker, depth + 1)
    ) {
      return true;
    }
  }
  return false;
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
      // `NEXT_REQUEST_POLICY` asks for 15s of readahead and the server serves a bounded
      // amount beyond it, so a large goal just produces requests it declines. 30s is a
      // compromise between that and rebuffering. It is *not* what stops protected videos
      // around the one-minute mark — that is the attestation gate, see
      // SABR_ATTESTATION_REQUIRED.
      bufferingGoal: 30,
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

  /**
   * The token the server minted for this video, if it managed to.
   *
   * Read through a mutable holder rather than captured, because `applySource` swaps the
   * session on reload and googlevideo calls this callback per request — a captured value
   * would keep sending the token from the session that has just been replaced.
   *
   * BotGuard stays out of the client entirely: the server already attests, and a second
   * attestation from the browser would be a second identity for the same playback.
   */
  let poToken = initialSource.sabr.poToken;

  // Registered only when the server actually produced a token. googlevideo sends
  // `base64ToU8(await cb())` unconditionally once a callback exists, so returning an empty
  // string would put a zero-length token in the request body — a malformed token rather
  // than no token, which is the worse of the two to send.
  if (poToken) sabr.onMintPoToken(async () => poToken ?? '');

  const applySource = (source: SabrPlayerSource) => {
    poToken = source.sabr.poToken;
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

  /**
   * The full variant list as the manifest declared it, captured once per load.
   *
   * `player.getVariantTracks()` omits variants Shaka has temporarily disabled after a
   * failed segment, so reading it live made the quality menu lose an entry every time
   * SABR answered a request with no media, and regain it 30 seconds later. The ladder a
   * video offers does not change while it plays, so it is read once and only the `active`
   * flags are refreshed afterwards.
   */
  let ladder: shaka.extern.Track[] = [];

  const tierKey = (variant: shaka.extern.Track) =>
    `${normalizeHeight(variant.width ?? 0, variant.height ?? 0)}/${Math.round(
      variant.frameRate ?? 0
    )}/${variant.hdr ?? ''}`;

  /**
   * One entry per resolution tier rather than per codec.
   *
   * YouTube ships the same resolution in avc1, vp09 and av01, and a separate codec
   * profile per resolution on top of that — twelve strings for a 4K video. With SABR the
   * server decides what it actually sends, so the codec is not a meaningful choice for
   * the viewer; the tier with the highest bitrate stands for the tier.
   */
  const videoTiers = (): EngineVideoRepresentation[] => {
    const byTier = new Map<string, shaka.extern.Track>();

    for (const variant of ladder) {
      if (!variant.originalVideoId) continue;
      const key = tierKey(variant);
      const best = byTier.get(key);
      if (
        !best ||
        (variant.videoBandwidth ?? variant.bandwidth) > (best.videoBandwidth ?? best.bandwidth)
      ) {
        byTier.set(key, variant);
      }
    }

    return [...byTier.values()]
      .map(variant => {
        const height = normalizeHeight(variant.width ?? 0, variant.height ?? 0);
        const frameRate = Math.round(variant.frameRate ?? 0);
        return {
          id: variant.originalVideoId,
          label: `${height}p${frameRate > 30 ? frameRate : ''}`,
          bitrate: variant.videoBandwidth ?? variant.bandwidth,
          codec: (variant.videoCodec ?? '').split('.')[0],
          width: variant.width ?? 0,
          height,
          frameRate,
          hdr: variant.hdr === 'PQ' || variant.hdr === 'HLG',
          hdrType: variant.hdr ?? undefined
        };
      })
      .sort((a, b) => a.height - b.height || a.bitrate - b.bitrate);
  };

  const toEngineAudioTracks = (): EngineAudioTrack[] => {
    const byLanguage = new Map<string, EngineAudioTrack>();

    for (const variant of ladder) {
      if (!variant.originalAudioId) continue;
      const language = variant.language || 'und';
      if (byLanguage.has(language)) continue;
      byLanguage.set(language, {
        id: language,
        active: false,
        language,
        label: variant.label || language
      });
    }

    const activeLanguage = player.getVariantTracks().find(variant => variant.active)?.language;
    const active = byLanguage.get(activeLanguage || '');
    if (active) active.active = true;

    return [...byLanguage.values()];
  };

  /**
   * A Shaka variant is an (audio, video) pair, so selecting one by its video side alone
   * would drag along whatever audio happens to come first and reset the viewer's language.
   * Prefer the pairing that keeps the current audio, and treat the tier — not the exact
   * representation — as what was asked for, so a momentarily disabled variant still
   * resolves to the resolution the viewer picked.
   */
  const findVideoVariant = (representationId: string) => {
    const playable = player.getVariantTracks();
    const active = playable.find(track => track.active);
    const wanted = ladder.find(variant => variant.originalVideoId === representationId);

    const candidates = playable.filter(
      track =>
        track.originalVideoId === representationId || (wanted && tierKey(track) === tierKey(wanted))
    );

    return (
      candidates.find(
        track =>
          track.originalVideoId === representationId &&
          track.originalAudioId === active?.originalAudioId
      ) ??
      candidates.find(track => track.originalVideoId === representationId) ??
      candidates.find(track => track.originalAudioId === active?.originalAudioId) ??
      candidates[0]
    );
  };

  const refreshTracks = () => {
    const active = player.getVariantTracks().find(variant => variant.active);
    const tiers = videoTiers();

    // The variant playing is one codec of a tier while the menu lists the tier, so the
    // highlight has to land on the tier's stand-in rather than on an id nothing lists.
    const activeTier = active
      ? tiers.find(
          tier =>
            tier.height === normalizeHeight(active.width ?? 0, active.height ?? 0) &&
            tier.frameRate === Math.round(active.frameRate ?? 0)
        )
      : undefined;

    ctx.state.videoTracks = mapVideoTracks(
      [{ id: 'video', active: true, representations: tiers }],
      activeTier?.id ?? null
    );

    const audioTracks = toEngineAudioTracks();
    ctx.state.languageList = mapLanguageList(audioTracks);
    if (active?.language) ctx.state.selectedLanguage = active.language;
  };

  player.addEventListener('trackschanged', refreshTracks);
  player.addEventListener('variantchanged', refreshTracks);
  player.addEventListener('adaptation', refreshTracks);

  player.addEventListener('error', event => {
    const detail = (event as unknown as { detail?: ShakaErrorDetail }).detail;

    // Shaka keeps retrying recoverable errors on its own; only a critical one means
    // playback has actually stopped.
    const fatal = detail?.severity !== 1;

    // Every one of these used to raise a toast, including the ones Shaka recovers from
    // without the viewer ever noticing — dozens of "the video stream could not be loaded"
    // over a minute of playback that was, from the outside, working. A response with no
    // media in it is not even a failure: the SABR server decides how far ahead it will
    // serve, and refusing to serve more is how it says "you have enough for now".
    if (!fatal) {
      if (import.meta.dev && !isNoMedia(detail)) {
        console.debug('[sabr] recovered from', detail?.code, detail?.data);
      }
      return;
    }

    // Only the first one is worth showing. Once playback has stopped Shaka keeps
    // re-picking variants and failing again, and the error overlay is already up — the
    // follow-ups only pile toasts on top of a message the viewer has already read.
    const alreadyReported = !!ctx.state.error?.fatal;

    const message = describeShakaError(detail);
    ctx.state.error = { code: `shaka-${detail?.code ?? 'unknown'}`, message, fatal };
    ctx.state.buffering = false;
    if (!alreadyReported) {
      ctx.createMessage({ type: 'error', title: 'Video playback error', message });
    }
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

      // Read before playback can disable anything: this is the only point at which
      // getVariantTracks() is guaranteed to be the manifest's full ladder.
      ladder = player.getVariantTracks();

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
      if (representationId === null) {
        player.configure({ abr: { enabled: true } });
        ctx.state.automaticVideoQuality = true;
      } else {
        const variant = findVideoVariant(representationId);
        if (variant) {
          player.configure({ abr: { enabled: false } });
          player.selectVariantTrack(variant, true);
          ctx.state.automaticVideoQuality = false;
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
