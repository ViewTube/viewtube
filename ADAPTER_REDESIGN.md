# Player adapter redesign — draft

Goal: a clean adapter system that the SABR adapter can plug into without special-casing,
while keeping the surface that `watch.vue` / `Controls.vue` / `QualitySelector.vue`
consume unchanged. The current UI reads a reactive `videoState` and calls a set of
methods; both stay, only the internals are rethought.

## What the UI sees — three deliberate API changes

`useVideoState(...)` returns almost the same surface as today. Three changes are worth
the component edits; everything else stays identical so the remaining components
(Seekbar, PlayerUI, Poster, Settings, PlaybackSettings, Volume, Controls, SkipButton,
CaptionsRenderer, Chapters, SeekbarPreview) need no changes.

### Current UI surface (audited)

State fields read by components: `playing`, `buffering`, `currentTime`, `duration`,
`bufferLevel`, `volume`, `muted`, `speed`, `loop`, `videoTracks`, `audioTracks`,
`languageList`, `selectedLanguage`, `automaticVideoQuality`.

Methods called by components: `play`, `pause`, `setMuted`, `setVolume`, `setTime`,
`setLanguage`, `setVideoRepresentation`, `setAudioRepresentation`,
`setAutoVideoQuality`, `setPlaybackRate`, `setLoop`.

Dead surface (set but never read, or never called): `playerError` (set by all three
adapters, read by zero components), `stop()` (never called), `setAutoAudioQuality()`
(never called). Also `live` is read from `props.video` (the DTO) in ControlButtons, not
from `videoState` — the adapter has no way to communicate live state.

### Change 1 — unified quality methods

Replace `setVideoRepresentation(trackId, repId)` + `setAutoVideoQuality()` with a single
`setVideoQuality(trackId, repId | null)`. `null` means auto. Same for audio:
`setAudioQuality(trackId, repId | null)` replaces `setAudioRepresentation` +
`setAutoAudioQuality`.

The `trackId` is honored in *both* branches: when `repId` is `null` (auto), the adapter
still calls `setVideoTrack({ trackId })` first, then `unlockVideoRepresentations()` — so
switching codec and then clicking "Auto" keeps the codec choice and only releases the
quality lock. The current rx-player sketch's `null` branch ignored `trackId`, which
would silently discard the codec selection.

**QualitySelector.vue** — 2 video + 1 audio call sites change:

```diff
- @click.stop="videoState.setAutoVideoQuality()"
+ @click.stop="videoState.setVideoQuality(selectedVideoTrack.id, null)"

- @click.stop="videoState.setVideoRepresentation(selectedVideoTrack.id, representation.id)"
+ @click.stop="videoState.setVideoQuality(selectedVideoTrack.id, representation.id)"

- @click.stop="videoState.setAudioRepresentation(representation.trackId, representation.id)"
+ @click.stop="videoState.setAudioQuality(representation.trackId, representation.id)"
```

The `automaticVideoQuality` state field stays — the adapter sets it `true` when the last
call was `null`, `false` otherwise. QualitySelector already reads it for the "Auto"
highlight, so that logic is unchanged.

### Change 2 — `live` and `liveEdge` in state, `duration` stays finite

Add `live: boolean` and `liveEdge: number | null` to `PlayerState`. The adapter sets
these (hls.js knows its live sync position; SABR/DASH are never live).

**`duration` stays finite.** It is read by `keydownActions.ts:86,94` (number-key seeks,
End key), `mediaSession.ts:79` (`setPositionState` — Chrome rejects non-finite
duration), `Chapters.vue:11`, `SeekbarPreview.vue:73`, and `videoState.ts:188`
(`setVideoLength`). Setting it to `Infinity` breaks all of these. The current hls.js
behavior of `duration = liveSyncPosition` is a hack, but it is load-bearing. Keep it
finite; the new `live` / `liveEdge` fields carry the live-specific semantics
alongside, not instead of, `duration`.

Introduce a single `seekMax` field on `PlayerState` and route every seek/duration
consumer through it. `seekMax` is derived once in `videoState.ts` via `watchEffect`,
not manually by each adapter:

```ts
// in videoState.ts, after state is created:
watchEffect(() => {
  state.seekMax = state.live ? (state.liveEdge ?? state.duration) : state.duration;
});
```

Adapters maintain only the three inputs (`live`, `liveEdge`, `duration`); the
`watchEffect` tracks them reactively and updates `seekMax` automatically. This avoids
scattering `live ? liveEdge : duration` ternaries across six consumers AND avoids a
stale `seekMax` if one adapter write site forgets to re-derive.
Components read `videoState.video.seekMax` — it's on the same surface they already use.

**ControlButtons.vue** — stop reading `props.video.live`, read state instead, and use
`liveEdge` for the countdown:

```diff
  const timestampText = computed(() => {
-   if (props.video.live) {
-     return `-${getTimestampFromSeconds(props.videoState.video.duration)}`;
+   if (props.videoState.video.live) {
+     const behind = (props.videoState.video.liveEdge ?? 0) - props.videoState.video.currentTime;
+     return `-${getTimestampFromSeconds(behind)}`;
    }
    return getTimestampFromSeconds(props.videoState.video.currentTime);
  });
  const videoLengthText = computed(() => {
-   if (props.video.live) {
+   if (props.videoState.video.live) {
      return 'LIVE';
    }
    return getTimestampFromSeconds(props.videoState.video.duration);
  });
```

**Seekbar.vue** — `onPointerMove` (`time = duration * percent`, line 56) and the two
width computeds all switch to `seekMax` (`videoState.video.seekMax`). `Chapters.vue:11`
and `SeekbarPreview.vue:73` also read `duration` for chapter/preview positioning — for
live these are already no-ops (no chapters, no preview thumbnails on live), but route
them through `seekMax` anyway for consistency.

**`keydownActions.ts`** — number-key seeks (`duration / 10 * n`, line 86) and End key
(`setTime(duration)`, line 94) switch to `seekMax`. For live, number-key seeking is
meaningless; gate it on `!live` or seek relative to `liveEdge`.

**`mediaSession.ts:79`** — `setPositionState({ duration, position })` keeps using finite
`duration` (the `liveSyncPosition` value). But `position` (`currentTime`) can exceed
`duration` when the user is at the live edge (sync position sits behind the edge by the
target latency), and Chrome throws `TypeError` if `position > duration`. Route the
duration through `seekMax` and clamp position: `position: Math.min(currentTime, seekMax)`.
This is a bug fix — today's code can throw on every `timeupdate` near the live edge.

This is the riskiest change in the plan — it touches 6 consumers, not 2. It gets its
own migration step (see end of doc).

### Change 3 — structured `error` in state, actually surfaced

Replace the dead `playerError: Error | null` with `error: PlayerError | null`:

```ts
export interface PlayerError {
  code: string;       // 'no-source' | 'autoplay-blocked' | 'live-ended' | 'segment-load' | ...
  message: string;
  fatal: boolean;     // fatal = playback can't continue; non-fatal = toast and retry
}
```

**New `PlayerErrorOverlay.vue`** (not Poster) — `Poster.vue:27` is `v-if="posterVisible"`,
which is dismissed as soon as playback starts, so a fatal error mid-playback (segment
load failure, `live-ended`, SABR reload failure) would render into a hidden element.
The overlay must be a sibling of Poster in `PlayerUI.vue`, visible whenever
`state.error?.fatal` regardless of poster state:

```vue
<!-- in PlayerUI.vue, alongside FlipPoster -->
<FlipPlayerErrorOverlay v-if="videoState.video.error?.fatal" :error="videoState.video.error" />
```

The `kind: 'none'` case (no playable source) is the only error that coincides with
poster-visible, so Poster's existing click-to-retry still covers it; the overlay covers
everything else. Non-fatal errors continue through `createMessage` toasts as today.

### What stays identical

The return shape of `useVideoState`:

```ts
{
  video,            // reactive PlayerState (with the 3 additions above)
  play, pause, stop,
  setVolume, setMuted, setPlaybackRate,
  setTime, setLoop,
  setLanguage,
  setVideoQuality, setAudioQuality   // renamed from setVideoRepresentation/setAutoVideoQuality
}
```

`stop()` stays on the public surface — `mediaSession.ts:8` types it as
`VideoState['stop']` and `:44` wires the `'stop'` action handler. (Live bug while we're
here: `mediaSession.ts:18` destructures `play, pause, setTime, onNextTrack` but **not**
`stop`, so the handler at `:45` currently calls the global `window.stop()`, aborting
page loads. Fix by destructuring `stop` and passing it through.)

`setAutoAudioQuality()` is dropped from the public surface (never called by any
component; the audio "Auto" path is `setAudioQuality(trackId, null)`).

Internally `setVideoQuality` / `setAudioQuality` delegate to the `PlayerAdapter`
methods of the same name.

---

## Core types — `utils/videoplayer/types.ts`

```ts
export type PlayerSource =
  | { kind: 'sabr'; manifest: string; sabr: SabrSource }
  | { kind: 'dash'; manifest: string }
  | { kind: 'hls'; url: string }
  | { kind: 'native'; url: string }
  | { kind: 'none'; reason: string };

export interface SabrSource {
  streamingUrl: string;        // already host-rewritten to /api/videoplayback
  formats: SabrFormat[];        // from server_abr adaptive_formats
  ustreamerConfig: string;      // base64
  poToken: string;
  clientInfo: { osName: string; osVersion: string; clientName: number; clientVersion: string };
}

export interface PlayerError {
  code: string;
  message: string;
  fatal: boolean;
}

export interface PlayerState {
  playing: boolean;
  buffering: boolean;
  bufferLevel: number;         // delta: seconds buffered AHEAD of playhead (see elementState contract)
  currentTime: number;
  duration: number;            // finite; for live = liveSyncPosition (load-bearing, see Change 2)
  seekMax: number;             // derived via watchEffect in videoState.ts from live/liveEdge/duration;
                               // the single accessor every seek/duration consumer routes through (Change 2)
  volume: number;
  muted: boolean;
  loop: boolean;
  speed: number;
  live: boolean;               // owned by the adapter (hls sets it; dash/sabr set false)
  liveEdge: number | null;     // owned by the adapter; null for VOD
  videoTracks: VideoTrack[];
  audioTracks: AudioTrack[];
  languageList: Language[];
  selectedLanguage: string;
  automaticVideoQuality: boolean;
  automaticAudioQuality: boolean;
  error: PlayerError | null;   // renamed from playerError, now structured + surfaced
}

export interface PlayerAdapter {
  load(source: PlayerSource, startTime: number): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  stop(): void;
  seekTo(time: number): void;
  setVolume(volume: number): void;
  setMuted(muted: boolean): void;
  setPlaybackRate(rate: number): void;
  setLanguage(language: string): void;
  setVideoQuality(trackId: string, representationId: string | null): void;
  setAudioQuality(trackId: string, representationId: string | null): void;
  destroy(): void;
}
```

`VideoTrack`, `AudioTrack`, `Language`, `Representation` stay in
`interfaces/VideoState.ts` unchanged — they already describe what the UI needs.

### Why `load()` instead of construct-with-source

The adapter is created once per element; `load()` is called for the initial video and
again when the source changes (SABR `onReloadPlayerResponse`). Next-up and playlist
changes are handled by component remount (`watch.vue:294` `v-if="!videoPending"`), so
`load()` exists for SABR reload without a full remount. If the `kind` changes between
loads, the factory destroys and recreates the adapter; if only the URL/manifest changes
within the same kind, the adapter handles it in `load()`.

---

## Pure helpers — `utils/videoplayer/format.ts`

Replaces the duplicated width→height table and `humanizeBitrate` auto-import.

```ts
// Preserves the existing (buggy-but-load-bearing) 3840→2560 mapping used by both
// current adapters. Fixing it to 2160 is a visible label change and is called out
// separately in the migration notes, not silently folded in here.
const HEIGHT_BY_WIDTH: Record<number, number> = {
  3840: 2560, 2560: 1440, 1920: 1080, 1280: 720,
  854: 480, 640: 360, 426: 240, 256: 144
};

export function normalizeHeight(width: number, height: number): number {
  return HEIGHT_BY_WIDTH[width] ?? height;
}

// Output preserved verbatim from utils/humanizeBitrate.ts to avoid visible label
// changes: "< 1000 → bps", "< 1e6 → kbps", "else → mbps" (lowercase, no decimals).
export function humanizeBitrate(bitrate: number): string {
  if (bitrate < 1000) return `${bitrate} bps`;
  if (bitrate < 1_000_000) return `${Math.round(bitrate / 1000)} kbps`;
  return `${Math.round(bitrate / 1_000_000)} mbps`;
}

export function formatQualityLabel(opts: {
  width: number; height: number; frameRate: number; bitrate: number;
}): string {
  const h = normalizeHeight(opts.width, opts.height);
  const fps = opts.frameRate > 30 ? opts.frameRate : '';
  return `${h}p${fps} · ${humanizeBitrate(opts.bitrate)}`;
}
```

## Pure mappers — `utils/videoplayer/mappers.ts`

Each engine (rx-player, hls.js, Shaka) has its own track shape. Mappers take the
engine's native track list + the currently-active ids and return the viewtube
`VideoTrack[]` / `AudioTrack[]` / `Language[]`. Pure functions, unit-testable without a
DOM.

```ts
export function mapVideoTracks(
  tracks: EngineVideoTrack[],
  activeRepresentationId: string | null
): VideoTrack[] { /* ... */ }

export function mapAudioTracks(
  tracks: EngineAudioTrack[],
  activeRepresentationId: string | null,
  selectedLanguage: string
): AudioTrack[] { /* ... */ }

export function mapLanguageList(tracks: EngineAudioTrack[]): Language[] { /* ... */ }
```

The `EngineVideoTrack` / `EngineAudioTrack` types are thin normalization interfaces each
adapter maps *its* library's types into before calling these — keeps the mappers
library-agnostic and lets the SABR/Shaka adapter reuse them.

---

## Shared element wiring — `utils/videoplayer/elementState.ts`

One place that wires `HTMLMediaElement` events → `PlayerState`. Used by every adapter
that drives a `<video>` element directly (native, hls, sabr/shaka all expose a video
element; rx-player manages its own element events but can use this for the subset it
doesn't already handle).

**`bufferLevel` contract:** a *delta* — seconds buffered ahead of the playhead, computed
from the `TimeRanges` range *containing* `currentTime` (not the last range, which
overstates buffer after a seek across a gap): `buffered.end(containingRange) - currentTime`,
clamped to `>= 0`. The current rx-player adapter sets it to
`position.position + position.bufferGap` (an absolute timeline position), and
`Seekbar.vue:27` then renders `(currentTime + bufferLevel) / duration`, double-counting
`currentTime`. `elementState` defines it as a delta so the Seekbar formula becomes
simply `(currentTime + bufferLevel) / seekMax` with no double-count. The rx-player
adapter maps `bufferGap` → `bufferLevel` directly (it's already a delta there; the bug
was only in how it was assigned).

**`duration` is NOT written by `useElementState`.** `videoEl.duration` is `Infinity` on
live playlists (hls.js sets `mediaSource.duration = Infinity`; native iOS HLS live does
the same), which is exactly what Change 2 forbids. Each adapter owns `duration`:
rx-player/shaka get it from their position updates (finite), hls.js substitutes
`liveSyncPosition` (finite, load-bearing), native filters `duration < Infinity` as
today (`nativeAdapter.ts:65-71`). `useElementState` handles only the events that are
uniform across all adapters.

```ts
export function useElementState(
  videoEl: HTMLVideoElement,
  state: PlayerState,
  opts: {
    onEnded: () => void;
    onAutoplayBlocked?: () => void;
  }
): () => void {  // returns cleanup
  // canplay      -> buffering = false
  // playing      -> playing = true, buffering = false
  // pause        -> playing = false, buffering = false
  // waiting      -> buffering = true
  // ended        -> playing = false, buffering = false, onEnded()
  // timeupdate   -> currentTime;
  //                 bufferLevel = max(0, buffered.end(containingRange) - currentTime)  (delta)
  //                 (NOT duration — the adapter owns it, see above)
  // volumechange -> volume, muted
  // error        -> state.error = { fatal: true, code: 'element', message: ... }
}
```

This kills the triple-duplicated event blocks in hls/native/rx and fixes the iPhone
"buffering never resets" bug (the `live` branch in native that skipped all listeners is
gone — `useElementState` always registers). `live`/`liveEdge`/`duration` are set by the
adapter, not by `useElementState`, since only the adapter knows whether the source is
live and what the seekable edge is.

---

## Adapter factory — `utils/videoplayer/adapters/index.ts`

```ts
export async function createAdapter(
  source: PlayerSource,
  ctx: AdapterContext
): Promise<PlayerAdapter> {
  switch (source.kind) {
    case 'sabr':  return createSabrAdapter(source, ctx);
    case 'dash':  return createDashAdapter(source, ctx);
    case 'hls':   return createHlsAdapter(source, ctx);
    case 'native':return createNativeAdapter(source, ctx);
    case 'none':  return createNoOpAdapter(source, ctx);  // shows error, does nothing
  }
}

export interface AdapterContext {
  videoElementRef: Ref<HTMLVideoElement>;
  state: PlayerState;            // the reactive object the adapter mutates
  defaultVolume: Ref<number>;
  loop: boolean;
  autoplay: boolean;
  maximumQuality: string | undefined;
  onEnded: () => void;
  createMessage: (...args: any[]) => void;
}
```

Note: `source` is passed to the factory *and* to `load()`. The factory uses `kind` to
pick the implementation; `load()` carries the actual URL/manifest. For the initial load
they're the same object; for a reload, `load()` gets a new source of the same kind.

---

## The four adapters (sketches)

### `dashAdapter.ts` (rx-player, renamed)

```ts
export async function createDashAdapter(
  _source: PlayerSource,
  ctx: AdapterContext
): Promise<PlayerAdapter> {
  const RxPlayer = await import('rx-player/minimal').then(m => m.default);
  // ... DASH_WASM init, worker attach (with UI signal on failure)

  const player = new RxPlayer({ videoElement: ctx.videoElementRef.value });
  registerRxEvents(player, ctx);   // playerStateChange, positionUpdate, volumeChange,
                                   // availableVideoTracksChange, etc. → ctx.state

  let currentSource: { kind: 'dash'; manifest: string } | null = null;

  return {
    async load(source, startTime) {
      if (source.kind !== 'dash') throw new Error(`dashAdapter: expected dash, got ${source.kind}`);
      currentSource = source;
      player.loadVideo({
        transport: 'dash',
        url: source.manifest,
        startAt: { position: startTime },
        autoPlay: ctx.autoplay,
        requestConfig: { segment: { maxRetry: 5, retryDelay: 'linear' } }
      });
    },
    play: () => player.play(),
    pause: () => player.pause(),
    stop: () => player.pause(),
    seekTo: t => player.seekTo(t),
    setVolume: v => player.setVolume(v),
    setMuted: m => { ctx.videoElementRef.value.muted = m; ctx.state.muted = m; },
    setPlaybackRate: r => player.setPlaybackRate(r),
    setLanguage: lang => { /* find track by language, setAudioTrack */ },
    setVideoQuality: (trackId, repId) => {
      // Atomic: setVideoTrack accepts lockedRepresentations directly (null = unlocked).
      // Splitting setVideoTrack + lockVideoRepresentations is two operations with a
      // possible rebuffer between; the atomic form does both in one track-store call.
      // Both methods throw "No content loaded" if called before loadVideo — guard.
      if (!currentSource) return;
      player.setVideoTrack({
        trackId,
        switchingMode: 'seamless',
        lockedRepresentations: repId ? [repId] : null
      });
      ctx.state.automaticVideoQuality = repId === null;
      // Apply the quality cap ONLY on the auto (unlock) path. lockVideoRepresentations
      // replaces the locked set, so calling applyQualityCap after a manual lock would
      // silently revert the user's selection to auto-within-cap.
      if (repId === null) applyQualityCap(player, ctx.maximumQuality);
    },
    setAudioQuality: (trackId, repId) => {
      if (!currentSource) return;
      player.setAudioTrack({
        trackId,
        switchingMode: 'seamless',
        lockedRepresentations: repId ? [repId] : null
      });
      ctx.state.automaticAudioQuality = repId === null;
    },
    destroy: () => { player.stop(); player.dispose(); }
  };
}
```

Fixes vs. current: retries capped at 5 with backoff; quality cap re-applied on track
change; `maximumQuality` undefined no longer throws; mute routed through adapter.

### `hlsAdapter.ts`

```ts
export async function createHlsAdapter(_source, ctx): Promise<PlayerAdapter> {
  const Hls = await import('hls.js').then(m => m.default);
  const hls = new Hls({ /* ...same buffering config... */ });
  hls.attachMedia(ctx.videoElementRef.value);

  // useElementState does NOT write duration for live — videoEl.duration is Infinity
  // on live playlists (hls.js sets mediaSource.duration = Infinity), which is exactly
  // what Change 2 forbids. The adapter owns duration: for live it stays finite at
  // liveSyncPosition (load-bearing, same as today's hlsAdapter.ts:85); useElementState
  // is only used for the events it handles (canplay/playing/pause/waiting/ended/
  // timeupdate→currentTime+bufferLevel/volumechange/error).
  const cleanup = useElementState(ctx.videoElementRef.value, ctx.state, {
    onEnded: ctx.onEnded
  });

  // The adapter sets live/liveEdge/duration from hls.js events:
  hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
    ctx.state.live = data.details.live;
    if (data.details.live) {
      // liveSyncPosition is null until enough fragments are loaded — guard with
      // Number.isFinite before assigning, or duration becomes NaN.
      const sync = hls.liveSyncPosition;
      if (Number.isFinite(sync)) {
        ctx.state.liveEdge = sync;
        ctx.state.duration = sync;   // finite, load-bearing
      }
    } else {
      // Stream ended (ENDLIST appended): live flips to false, duration becomes the
      // real VOD duration. Read it from the element (finite now that it's not live).
      ctx.state.liveEdge = null;
      const d = ctx.videoElementRef.value.duration;
      if (Number.isFinite(d)) ctx.state.duration = d;
    }
  });
  hls.on(Hls.Events.FRAG_LOADED, () => {
    if (ctx.state.live) {
      const sync = hls.liveSyncPosition;
      if (Number.isFinite(sync)) {
        ctx.state.liveEdge = sync;
        ctx.state.duration = sync;
      }
    }
  });

  // debounced track refresh on LEVEL_SWITCHED + LEVEL_UPDATED only
  // setLanguage via hls.audioTracks (no longer a no-op)
  // fragLoadError after N retries → ctx.state.error = { fatal: false, code: 'live-ended' }

  return {
    async load(source, startTime) {
      if (source.kind !== 'hls') throw new Error(`hlsAdapter: expected hls, got ${source.kind}`);
      hls.loadSource(applyStreamProxy(source.url));
      if (startTime) seekOnLoadedMetadata(ctx.videoElementRef.value, startTime);
    },
    // ... play/pause/seek via element, setVideoQuality via hls.currentLevel / -1
    destroy: () => { hls.stopLoad(); hls.destroy(); cleanup(); }
  };
}
```

Fixes vs. current: `duration` stays finite (= `liveSyncPosition`) for live while
`live`/`liveEdge` carry the live semantics (Change 2); multi-language live via
`hls.audioTracks`; debounced refresh; dead-stream detection; `liveSyncPosition` null
guarded; live→VOD transition (ENDLIST) updates duration. The adapter, not
`useElementState`, owns `duration`/`live`/`liveEdge` because only the adapter knows
whether the source is live and what the seekable edge is.

**Note on `seekMax` for live:** the hls adapter assigns `liveSyncPosition` to both
`duration` and `liveEdge`, so `seekMax = live ? liveEdge ?? duration : duration`
resolves to `duration` — the `seekMax` indirection is a no-op for the only live
backend. This is behavior-neutral: step 6 (the riskiest change) doesn't alter live
seeking behavior. The design question is whether `liveEdge` should instead be
`seekable.end(seekable.length - 1)` (the actual seekable edge, ahead of the sync
position by the target latency) while `duration` stays at `liveSyncPosition`. That
would make `seekMax` meaningful for live (users could seek closer to the edge than
the sync position). Worth deciding deliberately, but not required for the initial
migration — the no-op behavior matches today's.

### `nativeAdapter.ts`

```ts
export async function createNativeAdapter(_source, ctx): Promise<PlayerAdapter> {
  const videoEl = ctx.videoElementRef.value;
  const cleanup = useElementState(videoEl, ctx.state, {
    onEnded: ctx.onEnded,
    onAutoplayBlocked: () => ctx.createMessage({ type: 'error', title: 'Autoplay blocked', message: '...' })
  });

  // useElementState does NOT write duration (see elementState contract). Native HLS
  // live sets videoEl.duration = Infinity, so filter it the same way as today's
  // nativeAdapter.ts:65-71. For VOD, videoEl.duration is finite and passes through.
  videoEl.addEventListener('timeupdate', () => {
    if (!isNaN(videoEl.duration) && videoEl.duration >= 0 && videoEl.duration < Infinity) {
      ctx.state.duration = videoEl.duration;
    }
  });

  return {
    async load(source, startTime) {
      if (source.kind !== 'native') throw new Error(`nativeAdapter: expected native, got ${source.kind}`);
      const srcEl = document.createElement('source');
      srcEl.src = applyStreamProxy(source.url);
      srcEl.type = 'application/vnd.apple.mpegurl';
      videoEl.appendChild(srcEl);
      seekOnLoadedMetadata(videoEl, startTime);
    },
    // ... play/pause/seek/volume via element
    setLanguage: () => {}, setVideoQuality: () => {}, setAudioQuality: () => {},
    destroy: () => {
      videoEl.pause();
      videoEl.querySelectorAll('source').forEach(s => s.remove());
      videoEl.removeAttribute('src');
      videoEl.load();
      cleanup();
    }
  };
}
```

Fixes vs. current: iPhone gets `waiting`/`playing` events via `useElementState`;
`destroy` actually cleans up; seek waits for `loadedmetadata`; duration listener
preserved (filtering `Infinity` for live) since `useElementState` no longer writes it.

### `sabrAdapter.ts` (new — Shaka inside)

```ts
export async function createSabrAdapter(_source, ctx): Promise<PlayerAdapter> {
  const shaka = await import('shaka-player');
  const { SabrStreamingAdapter, SabrUmpProcessor } = await import('@luanrt/googlevideo');

  const player = new shaka.Player(ctx.videoElementRef.value);
  player.configure({
    dash: { /* representationFilter: keep one rep per language, drop thumbnails */ },
    streaming: { useNativeHlsForFairPlay: true }
  });

  const sabr = new SabrStreamingAdapter({
    playerAdapter: new ViewTubeSabrPlayerAdapter(player, ctx.videoElementRef.value),
    clientInfo: /* from source.sabr */
  });
  sabr.onReloadPlayerResponse(async (reloadCtx) => {
    // re-fetch /api/videos/:id, call load() with the new SABR source
  });
  sabr.attach(player);

  const cleanup = useElementState(ctx.videoElementRef.value, ctx.state, { onEnded: ctx.onEnded });

  // map shaka tracks → viewtube tracks via mappers.ts

  return {
    async load(source, startTime) {
      if (source.kind !== 'sabr') throw new Error(`sabrAdapter: expected sabr, got ${source.kind}`);
      sabr.setStreamingURL(source.sabr.streamingUrl);
      sabr.setServerAbrFormats(source.sabr.formats);
      sabr.setUstreamerConfig(source.sabr.ustreamerConfig);
      sabr.setPoToken(source.sabr.poToken);
      await player.load(source.manifest, startTime);
    },
    play: () => ctx.videoElementRef.value.play(),
    pause: () => ctx.videoElementRef.value.pause(),
    seekTo: t => { ctx.videoElementRef.value.currentTime = t; },
    setVideoQuality: (trackId, repId) => {
      // repId null → auto (sabr default); else set preferredVideoFormatIds
      ctx.state.automaticVideoQuality = repId === null;
    },
    // ...
    destroy: () => { sabr.detach(); player.destroy(); cleanup(); }
  };
}
```

`ViewTubeSabrPlayerAdapter` (in the same file or `sabrPlayerAdapter.ts`) implements
`SabrPlayerAdapter`: `getPlayerTime`, `getPlaybackRate`, `getBandwidthEstimate`,
`getActiveTrackFormats`, `registerRequestInterceptor`, `registerResponseInterceptor` —
delegating to the Shaka player and the video element. This is the only place that knows
about Shaka's request/response types; the rest of viewtube never sees Shaka.

---

## `videoSource.ts` — returns `PlayerSource`

```ts
export const useVideoSource = (video: Ref<ApiDto<'VTVideoInfoDto'>>) => {
  const config = useRuntimeConfig();
  const { isIOSOnIPhone } = useIsIOS();
  // Hoist useProxyUrls() to the composable body — calling it inside the computed getter
  // would create a new computed() (via useApiUrl) on every re-evaluation.
  const { videoPlaybackProxy } = useProxyUrls();

  // The DASH manifest's segment URLs contain the full googlevideo.com host + path.
  // googlevideoRegex matches only the host, so the replacement target is the proxy
  // ORIGIN (no path) — the URL's own /videoplayback?... path stays intact. This is
  // distinct from videoPlaybackProxy, which is the full /api/videoplayback path used
  // for the SABR endpoint rewrite. Keep both.
  const proxyOrigin = computed(() => {
    if (typeof config.public.videoplaybackProxy === 'string' && config.public.videoplaybackProxy.length > 0) {
      return config.public.videoplaybackProxy;   // deployment override preserved
    }
    return `${window.location.origin}/api`;
  });

  const source = computed<PlayerSource>(() => {
    // SSR guard: the computed reads window/document (isHlsSupportedNatively, window.location).
    // Don't evaluate server-side — embed/[id].vue has no pending guard. Use a sentinel
    // code the error overlay filters out rather than a user-visible fatal error string.
    if (!import.meta.client) return { kind: 'none', reason: '__SSR__' };

    const v = video.value;
    if (v.live && v.hlsManifestUrl) {
      return isHlsSupportedNatively() && isIOSOnIPhone.value
        ? { kind: 'native', url: v.hlsManifestUrl }
        : { kind: 'hls', url: v.hlsManifestUrl };
    }
    if (v.sabr) {
      return {
        kind: 'sabr',
        manifest: proxyManifest(v.sabr.dashManifest, proxyOrigin.value),
        sabr: {
          streamingUrl: rewriteSabrHost(v.sabr.streamingUrl, videoPlaybackProxy),
          formats: v.sabr.formats,
          ustreamerConfig: v.sabr.ustreamerConfig,
          poToken: v.sabr.poToken,
          clientInfo: v.sabr.clientInfo
        }
      };
    }
    if (v.dashManifest) {
      return { kind: 'dash', manifest: proxyManifest(v.dashManifest, proxyOrigin.value) };
    }
    return { kind: 'none', reason: v.live ? 'No HLS manifest for this live stream' : 'No playable source' };
  });

  return { source };
};
```

The `kind: 'none'` case is now explicit — `videoState` shows an error instead of
spinning forever. `proxyManifest` (host-only regex replace, same as today's
`googlevideoRegex`) and `rewriteSabrHost` (full path replace for the SABR endpoint) live
in `proxy.ts`. `proxyManifest` uses `encodeURIComponent` + a TextEncoder-based base64
path instead of `btoa` so non-Latin1 manifest bytes don't throw.

---

## `videoState.ts` — owns state + adapter, reloads on source change

```ts
export const useVideoState = ({ videoElementRef, video, source, videoEnded, startTime, autoplay, embed }) => {
  // ... stores unchanged

  const state = reactive<PlayerState>({
    playing: false, buffering: true, bufferLevel: 0, currentTime: 0, duration: 0,
    seekMax: 0,
    volume: 1, muted: false, loop: false, speed: 1,
    live: !!video.live, liveEdge: null,   // video is a plain object (Player.vue:25), not a Ref
    videoTracks: [], audioTracks: [], languageList: [], selectedLanguage: 'en',
    automaticVideoQuality: true, automaticAudioQuality: true,
    error: null
  });

  let adapter: PlayerAdapter | null = null;
  let lastKind: PlayerSource['kind'] | null = null;
  let loadSeq = 0;
  let hasLoadedOnce = false;
  let currentVideoId: string | null = null;

  // Derive seekMax once from the three inputs the adapter owns. A watchEffect tracks
  // the reactive fields automatically — adapters never touch seekMax, they only set
  // live/liveEdge/duration. This avoids a stale seekbar if one adapter write site
  // forgets to re-derive.
  watchEffect(() => {
    state.seekMax = state.live ? (state.liveEdge ?? state.duration) : state.duration;
  });

  const load = async (src: PlayerSource) => {
    const seq = ++loadSeq;
    if (src.kind === 'none') {
      adapter?.destroy(); adapter = null; lastKind = null;
      // Reset live fields — if switching from a live stream to none, stale
      // live/liveEdge/duration would leave the seekbar in live mode.
      state.live = false; state.liveEdge = null; state.duration = 0;
      state.error = { code: 'no-source', message: src.reason, fatal: true };
      state.buffering = false;
      return;
    }
    state.error = null;

    // Recreate the adapter only when the kind changes. The race guard must come
    // immediately after each await — two concurrent loads can both pass the
    // lastKind check before either assigns it.
    if (lastKind !== src.kind) {
      adapter?.destroy();
      adapter = null;
      const created = await createAdapter(src, { videoElementRef, state, /* ...ctx... */ });
      if (seq !== loadSeq) { created.destroy(); return; }   // superseded during await
      adapter = created;
      lastKind = src.kind;
    }

    // For the first load, use the provided startTime (resume position / ?t= param).
    // For SABR onReloadPlayerResponse (same video, new source), resume at the current
    // playback position — passing the initial startTime mid-playback would seek back
    // to the start. Next-up is a different video and is handled by component remount
    // (watch.vue:294 v-if="!videoPending"), so it doesn't go through this reload path —
    // if it ever does, it must start at 0 or that video's own resume position, NOT the
    // previous video's currentTime. The discriminator is "same video id, new source",
    // not "have I loaded before".
    const isReload = src.kind === 'sabr' && hasLoadedOnce && currentVideoId === video.id;
    const startAt = isReload ? state.currentTime : (startTime?.value ?? 0);
    await adapter.load(src, startAt);
    if (seq !== loadSeq) return;   // a newer load superseded us during adapter.load

    // Apply post-load settings on the first successful load only. Today's
    // videoState.ts:117-120 does this synchronously after instantiateAdapter(); with
    // the deferred watch, load() is async, so doing it here (after the await) is the
    // earliest point where the adapter is guaranteed to exist.
    if (!hasLoadedOnce) {
      setLoop(settingsStore.alwaysLoopVideo);
      setPlaybackRate(settingsStore.defaultVideoSpeed);
    }
    hasLoadedOnce = true;
    currentVideoId = video.id;
  };

  // Defer the watch until mount: videoElementRef is null during setup (Player.vue:16),
  // and the source computed reads window/document (SSR-unsafe). onMounted guarantees
  // the element exists and we're client-side.
  onMounted(() => watch(source, load, { immediate: true }));

  // ... delegate to adapter with null guards ...
  const play = () => adapter?.play();
  const pause = () => { adapter?.pause(); saveVideoPosition(); };
  const stop = () => adapter?.stop();
  const setVideoQuality = (trackId: string, repId: string | null) =>
    adapter?.setVideoQuality(trackId, repId);
  const setAudioQuality = (trackId: string, repId: string | null) =>
    adapter?.setAudioQuality(trackId, repId);
  // ... setVolume, setMuted, setTime, setLoop, setLanguage, setPlaybackRate ...

  // Save position BEFORE destroying the adapter — nativeAdapter.destroy resets
  // currentTime to 0 via removeAttribute('src') + load(), which would otherwise
  // persist progress=0.
  const save = () => saveVideoPosition();
  onBeforeUnmount(() => { save(); adapter?.destroy(); });

  // pagehide: vtFetch won't reliably complete during page teardown. Use sendBeacon
  // for the history save so closing the tab actually records progress. sendBeacon
  // needs a Blob with content-type application/json — a bare string posts as
  // text/plain and Fastify won't parse it. Same-origin, so cookies are included.
  // Preserve the same guard as saveVideoPosition (videoState.ts:169): don't beacon
  // for live, embeds, logged-out users, or users who opted out of history.
  useEventListener('pagehide', () => {
    if (!settingsStore.saveVideoHistory || embed || !userStore.isLoggedIn || video.live) return;
    const body = JSON.stringify({
      progressSeconds: state.currentTime,
      lengthSeconds: state.duration
    });
    navigator.sendBeacon(
      `${apiUrl.value}user/history/${video.id}`,
      new Blob([body], { type: 'application/json' })
    );
  });

  return {
    video: state,
    play, pause, stop,
    setVolume, setMuted, setPlaybackRate,
    setTime, setLoop, setLanguage,
    setVideoQuality, setAudioQuality
  };
};
```

Key changes: `onMounted(() => watch(...))` (not `immediate` at setup — the element is
null and the source computed is SSR-unsafe); race guard placed after each `await` with
superseded adapters destroyed; SABR-reload (same video id) resumes at
`state.currentTime`, next-up (different video) starts at `startTime`/0; `seekMax`
derived via `watchEffect` (not manually by adapters); `setLoop`/`setPlaybackRate`
applied inside `load()` on first successful load (not via a broken `watch` on a plain
`let`); `none` case resets `live`/`liveEdge`/`duration`; position saved before
`destroy()`; `pagehide` uses `sendBeacon` with a JSON `Blob` and preserves the
`saveVideoPosition` guard; `none` source surfaces an error instead of hanging.

---

## File layout

```
utils/videoplayer/
  types.ts            # PlayerSource, PlayerState, PlayerAdapter, PlayerError, SabrSource
  format.ts           # normalizeHeight, humanizeBitrate, formatQualityLabel
  mappers.ts          # mapVideoTracks, mapAudioTracks, mapLanguageList (pure)
  elementState.ts     # useElementState (shared event wiring)
  proxy.ts            # proxyManifest, rewriteHost (replaces inline googlevideoRegex)
  adapters/
    index.ts          # createAdapter factory
    dashAdapter.ts    # rx-player (renamed from rxPlayerAdapter)
    hlsAdapter.ts
    nativeAdapter.ts
    sabrAdapter.ts    # new — Shaka + @luanrt/googlevideo
    sabrPlayerAdapter.ts  # ViewTubeSabrPlayerAdapter (SabrPlayerAdapter impl)
composables/videoplayer/
  videoSource.ts      # returns Ref<PlayerSource>
  videoState.ts       # owns state + adapter, exposes unchanged UI surface
interfaces/
  VideoState.ts       # unchanged (VideoTrack, AudioTrack, Language, Representation)
```

---

## Migration order (resequenced per review)

The review's resequencing is adopted: low-risk refactors and per-adapter fixes first,
the risky `live`/`liveEdge` consumer sweep as its own isolated step, and the
`videoState`/`videoSource` rework (which has the lifecycle bugs to fix) after the
ground is stable.

1. **Types + helpers** (`types.ts`, `format.ts`, `mappers.ts`, `elementState.ts`,
   `proxy.ts`) — pure extraction, no behavior change. Existing adapters import them.
   `format.ts` preserves the existing `3840→2560` mapping and `humanizeBitrate` output
   verbatim (visible label changes are called out in the "Visible behavior changes to
   flag" section at the end of the migration order, not folded in here).
   The `playerError` → `error` rename happens here (in `types.ts`) so adapters can
   write `state.error` from step 2 onward.
   Note: `utils/videoplayer/**` is NOT in Nuxt's auto-import manifest
   (`client/.nuxt/imports.d.ts`), so everything in these new files needs explicit
   imports from callers.
2. **`videoSource.ts` → `PlayerSource`** — including the `none` case, SSR guard,
   preserved `videoplaybackProxy` runtime config override, and the reconciled
   proxy-origin vs proxy-path distinction (host-only regex for DASH, full path for
   SABR). Fix `btoa` → TextEncoder-based base64 for non-Latin1. Must land before step 3
   so `createAdapter(source: PlayerSource, ctx)` has a `PlayerSource` to consume.
   **Also converts `videoState.ts`'s `switch (sourceType.value)` to `switch (source.value.kind)`**
   and drops the `sourceType` prop from `Player.vue` in the same step — otherwise the
   tree does not compile between steps 2 and 3 (step 3 is where `createAdapter` replaces
   the switch entirely).
3. **Adapter interface + factory** — wrap existing adapters in the `PlayerAdapter`
   shape; `videoState.ts` switches to `createAdapter`. UI surface unchanged. Pure
   refactor; behavior identical.
4. **Per-adapter fixes** (independent, any order) —
   - rx-player: quality cap re-applied on track change; `maximumQuality` undefined no
     longer throws; retries capped at 5 with backoff; mute routed through adapter.
   - hls.js: debounced track refresh; multi-language live via `hls.audioTracks`;
     dead-stream detection after N `fragLoadError` retries.
   - native: iPhone gets `waiting`/`playing` via `useElementState`; `destroy` cleans up
     `<source>` and calls `load()`; seek waits for `loadedmetadata`.
5. **Component API renames** (low-risk, independently valuable) —
   - `setVideoRepresentation`/`setAutoVideoQuality` → `setVideoQuality(trackId, repId | null)`
     in `QualitySelector.vue` (2 video + 1 audio call site).
   - `setAudioRepresentation` → `setAudioQuality`.
   - `error` in state: new `PlayerErrorOverlay.vue` in `PlayerUI.vue` (not Poster —
     Poster is hidden once playback starts).
   - Fix the live `mediaSession.ts` bug: destructure `stop` and pass it through instead
     of calling `window.stop()`.
   - Drop `setAutoAudioQuality()` from the public surface. Keep `stop()`.
6. **`live`/`liveEdge` consumer sweep** (riskiest change, isolated) —
   - Add `live`/`liveEdge`/`seekMax` to `PlayerState`; adapters set them and keep
     `seekMax` in sync.
   - Route every `duration` consumer through `seekMax`:
     `Seekbar.vue` (`onPointerMove` + 2 width computeds), `Chapters.vue:11`,
     `SeekbarPreview.vue:73`, `keydownActions.ts:86,94`, `videoState.ts:188`
     (`setVideoLength`).
   - `ControlButtons.vue`: read `videoState.video.live` instead of `props.video.live`;
     use `liveEdge` for the countdown.
   - `mediaSession.ts:79`: route `duration` through `seekMax` and clamp
     `position: Math.min(currentTime, seekMax)` — today's code can throw when
     `currentTime > duration` near the live edge.
   - `duration` stays finite for live (= `liveSyncPosition`); the new fields carry live
     semantics alongside, not instead of.
7. **`videoState.ts` reload-on-source-change** — `onMounted(() => watch(source, load))`
   with race guard after each `await` (superseded adapters destroyed), SABR-reload
   `startAt` (resume at `state.currentTime` only for same-video reload, not next-up),
   position saved before `destroy()`, `pagehide` via `sendBeacon`. Restore the
   `setLoop`/`setPlaybackRate` block that runs after the first successful load (today's
   `videoState.ts:117-120`) — with the deferred watch, `setPlaybackRate` would hit
   `adapter?.` === null and the user's default speed would never apply.
8. **SABR adapter** — now plugs into the clean interface; server DTO + proxy changes
   land alongside (per SABR_PLAN.md phases 1–2).

Steps 1–7 are worth doing regardless of SABR. Step 8 is the SABR work itself.

### Component change summary

| Component | Change | Step |
|---|---|---|
| `QualitySelector.vue` | 3 method renames (`setVideoQuality`/`setAudioQuality`) | 5 |
| `PlayerUI.vue` | add `FlipPlayerErrorOverlay` | 5 |
| `mediaSession.ts` | destructure `stop`, fix `window.stop()` bug; route `setPositionState` through `seekMax` + clamp position | 5, 6 |
| `ControlButtons.vue` | `props.video.live` → `videoState.video.live`; `liveEdge` countdown | 6 |
| `Seekbar.vue` | `seekMax` in `onPointerMove` + 2 computeds | 6 |
| `Chapters.vue` | `duration` → `seekMax` | 6 |
| `SeekbarPreview.vue` | `duration` → `seekMax` | 6 |
| `keydownActions.ts` | number-key + End seeks via `seekMax` | 6 |
| `Player.vue` | drop `sourceType` prop (now inside `PlayerSource`) | 2 |
| `PlayerErrorOverlay.vue` | new — fatal error overlay | 5 |

All other components (`Settings`, `PlaybackSettings`, `Volume`, `SkipButton`,
`CaptionsRenderer`, `Loading`, `Controls`) are unchanged.

### Visible behavior changes to flag (not silent)

- `3840 → 2560` height label: preserved as-is in step 1. A separate follow-up could fix
  it to `2160`, but that's a visible label change and should be its own decision.
- `humanizeBitrate` output: preserved verbatim (`5 mbps`, `bps` branch kept).
- `bufferLevel` semantics: changes from absolute (rx-player) to delta. The Seekbar
  formula changes from `(currentTime + bufferLevel) / duration` (double-count) to
  `(currentTime + bufferLevel) / seekMax` (correct). Visible: the buffer bar will render
  slightly differently — this is a bug fix, but it's a visible change.

---

## Feedback addressed (ADAPTER_REDESIGN_FEEDBACK.md)

### Blocking — fixed

- **#1 `watch(..., { immediate: true })` runs before `<video>` exists** — changed to
  `onMounted(() => watch(source, load, { immediate: true }))`.
- **#2 SSR evaluation of `window`/`document` computed** — `videoSource.ts` gains an
  `import.meta.client` guard returning `kind: 'none'` during SSR.
- **#3 `loadSeq` race guard placed after the thing it guards** — guard now comes
  immediately after each `await`; superseded adapters are destroyed.
- **#4 `destroy()` before `save()` saves position 0** — order swapped: `save()` then
  `destroy()`.
- **#5 Dropping `stop()` breaks `mediaSession.ts`** — `stop()` kept on the public
  surface; the live `window.stop()` bug (destructure missing `stop`) is called out as a
  fix in step 4.

### Correctness gaps — fixed

- **#6 `duration = Infinity` breaks 6 consumers** — `duration` stays finite; `live`/
  `liveEdge` added alongside; `seekMax` accessor routes all consumers. The
  `live`/`liveEdge` change is now its own migration step (5) with the full consumer
  sweep listed.
- **#7 `bufferLevel` double-count bug carried forward** — `elementState` contract
  defines `bufferLevel` as a delta; Seekbar formula corrected. Flagged as a visible
  behavior change.
- **#8 Fatal errors in Poster invisible mid-playback** — moved to a new
  `PlayerErrorOverlay.vue` in `PlayerUI.vue`, visible regardless of poster state.
- **#9 `load()` always passes `startTime`, wrong for reload** — first load uses
  `startTime`; reloads resume at `state.currentTime` via `hasLoadedOnce` flag.
- **#10 `useProxyUrls().videoPlaybackProxy` is a different string** — `videoSource.ts`
  now distinguishes proxy *origin* (host-only regex for DASH) from proxy *path* (full
  `/api/videoplayback` for SABR); both kept.
- **#11 `videoplaybackProxy` runtime config silently dropped** — override preserved in
  the `proxyOrigin` computed.

### Claims that did not survive — corrected

- **#12 "Fixes next-up/playlist" framing** — the plan now justifies `watch(source, load)`
  for SABR reload, not on an unverified next-up bug (remount already covers that).
- **#13 "3 call sites" vs diff** — corrected to 2 video + 1 audio.
- **#14 `setVideoQuality(trackId, null)` ignores `trackId`** — auto branch now calls
  `setVideoTrack({ trackId })` first, then `unlockVideoRepresentations()`, so codec
  choice survives.
- **#15 Silent behavior changes** — `3840→2560` mapping and `humanizeBitrate` output
  preserved verbatim; flagged in a "Visible behavior changes" section.
- **#16 "Pure, unit-testable"** — acknowledged: no unit test infra exists; it's a design
  property, not test coverage.

### Smaller notes — addressed

- dash sketch no longer returns an object literal with `stop` outside `PlayerAdapter`
  (interface now includes `stop`).
- `setMuted` is new work on rx-player — called out in step 3.
- `utils/videoplayer/**` not in Nuxt auto-import manifest — noted in step 1: explicit
  imports required.
- `PlayerSource.hls.live` dead field — removed.
- `state.live` ownership — documented: adapter owns it.
- `Player.vue:25` passes `video` as plain object — the sketch's `video.value.live` is
  corrected to `video.live` (plain object access) in the `state` initializer.
- `load()` kind guards now throw instead of silently returning.
- `pagehide` uses `sendBeacon` (via `saveVideoPositionBeacon`) instead of `vtFetch`.
- `btoa` → TextEncoder-based base64 in `proxy.ts`.

---

## Round 2 feedback addressed (ADAPTER_REDESIGN_FEEDBACK.md, round 2)

### Fixes that did not propagate — fixed

- **A. hlsAdapter sketch contradicted Change 2** — rewritten: `useElementState` no
  longer passed `live: true`; the adapter owns `duration`/`live`/`liveEdge` from hls.js
  events (`LEVEL_LOADED`, `FRAG_LOADED`), setting `duration = liveSyncPosition` (finite).
  The "duration stays Infinity" comment removed.
- **B. `useElementState` wrote `Infinity` for live** — `useElementState` no longer
  writes `duration` at all. Each adapter owns it: rx-player/shaka from position updates,
  hls.js substitutes `liveSyncPosition`, native filters `duration < Infinity` as today.
  Contract updated to state this explicitly.
- **C. `seekMax` had no home** — added as a field on `PlayerState`, derived via
  `watchEffect` in `videoState.ts` (not manually by adapters). Components read
  `videoState.video.seekMax` on the same surface they already use.

### New bug introduced by a fix — fixed

- **D. `hasLoadedOnce ? state.currentTime : startTime` wrong for next-up** — the
  discriminator is now "same video id, new source" (`isReload = src.kind === 'sabr' &&
  hasLoadedOnce && currentVideoId === video.id`), not "have I loaded before". Next-up is
  a different video and starts at `startTime`/0. The comment names only SABR reload,
  acknowledging that remount handles next-up today (#12).

### rx-player API issues — fixed

- **E. `applyQualityCap` after manual lock discards selection** — cap now applied ONLY
  on the `repId === null` (auto/unlock) path. `lockVideoRepresentations` replaces the
  locked set, so applying the cap after a manual lock would silently revert.
- **F. Split `setVideoTrack` + `lockVideoRepresentations` worse than atomic** —
  collapsed to `player.setVideoTrack({ trackId, switchingMode, lockedRepresentations:
  repId ? [repId] : null })` (verified: `public_api.ts:2607` accepts
  `lockedRepresentations` atomically, `null` = unlocked). Same for audio. Guard added
  for "No content loaded" throw before `loadVideo`.

### Smaller items — addressed

- **Step ordering 2 vs 6** — `videoSource.ts` → `PlayerSource` moved to step 2 (before
  the adapter factory at step 3) so `createAdapter(source: PlayerSource)` has a
  `PlayerSource` to consume.
- **Mount sequencing regression** — `setLoop`/`setPlaybackRate` applied inside
  `load()` on first successful load (after the `await adapter.load`), not via
  `watch(hasLoadedOnce)` which would never fire on a plain `let`.
- **`bufferLevel` overstates after seek** — contract now uses the range *containing*
  `currentTime`, not the last range, and clamps to `>= 0`.
- **`useProxyUrls()` inside computed** — hoisted to composable body.
- **`sendBeacon` content-type** — uses `new Blob([body], { type: 'application/json' })`,
  not a bare string.
- **SSR sentinel** — returns `{ kind: 'none', reason: '__SSR__' }`, a code the error
  overlay filters out rather than a user-visible fatal error string.
- **`error` rename sequencing** — moved to step 1 (types) so adapters can write
  `state.error` from step 2 onward.

---

## Round 3 feedback addressed (ADAPTER_REDESIGN_FEEDBACK.md, round 3)

### Fixes that did not work as written — fixed

- **1. `seekMax` missing from state initializer** — added `seekMax: 0` to the
  `reactive<PlayerState>({...})` initializer.
- **2. `watch(() => hasLoadedOnce, ...)` never fires** — `hasLoadedOnce` is a plain
  `let`, not reactive, so the getter registered no dependency. `setLoop`/
  `setPlaybackRate` moved inside `load()` on first successful load (after the
  `await adapter.load`), which is the earliest point where the adapter is guaranteed
  to exist.

### Guard dropped — fixed

- **3. `pagehide` beacon posts history unconditionally** — the `sendBeacon` handler
  now preserves the same guard as `saveVideoPosition` (`videoState.ts:169`):
  `if (!settingsStore.saveVideoHistory || embed || !userStore.isLoggedIn || video.live) return;`.

### Non-propagation — fixed

- **4. Native adapter never sets `duration`** — the native sketch now has a
  `timeupdate` listener that writes `ctx.state.duration` when
  `videoEl.duration < Infinity` (same filter as today's `nativeAdapter.ts:65-71`),
  since `useElementState` no longer writes duration.
- **5. `load()` guards throw in two adapters, return in two** — native and sabr
  `load()` guards now throw like dash and hls.
- **6. "Why `load()`" still rests on the retracted claim** — the "fixes the current
  'adapter only instantiates in `onMounted`' bug" sentence is cut; the section now
  says `load()` exists for SABR reload, and next-up is handled by remount.

### hls.js code — fixed

- **7. `hls.liveSyncPosition` can be `null`** — both handlers now guard with
  `Number.isFinite(sync)` before assigning to `state.duration`/`state.liveEdge`.
- **8. No branch for a live stream that ends** — `LEVEL_LOADED` now has an else
  branch: when `details.live` flips to false (ENDLIST), `liveEdge` is nulled and
  `duration` is read from the element (finite now that it's not live).
- **9. `duration === liveEdge` makes `seekMax` a no-op for live** — noted in the hls
  adapter section: the `seekMax` indirection is behavior-neutral for the only live
  backend (step 6 doesn't alter live seeking). The design question of whether
  `liveEdge` should be `seekable.end(n)` instead of `liveSyncPosition` is called out
  as a deliberate decision for later, not required for the initial migration.
- **10. `seekMax` "kept in sync by adapter" spreads a derived value** — changed to a
  `watchEffect` in `videoState.ts` that derives `seekMax` from `live`/`liveEdge`/
  `duration` automatically. Adapters maintain only the three inputs.

### Migration-order leftovers — fixed

- **Step 2 breaks the build for step 3** — step 2 now also converts
  `videoState.ts`'s `switch (sourceType.value)` to `switch (source.value.kind)` and
  drops the `sourceType` prop from `Player.vue`, so the tree compiles between steps 2
  and 3.
- **Stale cross-reference** — "visible label changes are called out in step 6"
  corrected to "the 'Visible behavior changes to flag' section at the end of the
  migration order".
