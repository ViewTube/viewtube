# Review of ADAPTER_REDESIGN.md

Every claim below was checked against the code at `6bda9edc`.

# Round 1 — review of the initial plan

**Verdict:** the diagnosis is sound and the target architecture is the right one. But the plan
under-scopes two of its three "deliberate API changes" — `duration = Infinity` and the error
overlay both break things the audit did not look at — and the `videoState.ts` sketch has a
lifecycle bug that will crash on first load. Migration steps 1–2 and 5 are safe; steps 3–4 need
rework before implementation.

---

## Blocking — will not work as written

### 1. `watch(source, load, { immediate: true })` runs before the `<video>` element exists

`useVideoState` is called in `Player.vue:22` setup; `videoElementRef` (`Player.vue:16`) is `null`
until mount. The current code uses `onMounted` for exactly this reason (`videoState.ts:114`). With
`immediate: true`, `createAdapter` runs at setup — `new RxPlayer({ videoElement: null })`,
`hls.attachMedia(null)`, and `nativeAdapter`'s `videoElementRef.value.appendChild(...)` all get
null. The dynamic `import()` await makes it racy rather than deterministically broken, which is
worse.

Fix: `onMounted(() => watch(source, load, { immediate: true }))`, or watch both `source` and
element readiness.

### 2. `immediate: true` also forces SSR evaluation of a `window`/`document` computed

`useVideoSource`'s computed reads `window.location.origin` (`videoSource.ts:11`) and calls
`isHlsSupportedNatively()`, which does `document.createElement`
(`utils/videoplayer/support.ts:2`). Today nothing reads that computed during SSR, so it is never
evaluated server-side. `immediate: true` reads it at setup. `pages/watch.vue:294` is guarded by
`!videoPending`, but `pages/embed/[id].vue:44` is only guarded by `v-if="video"` — no pending
guard.

Fix inside `videoSource.ts` with an `import.meta.client` guard rather than relying on the caller.

### 3. The `loadSeq` race guard is placed after the thing it guards

```ts
if (lastKind !== src.kind) { adapter?.destroy(); adapter = await createAdapter(...); lastKind = src.kind; }
if (seq !== loadSeq) return;   // ← too late
```

The `await createAdapter` is the long operation. Two concurrent loads both pass the `lastKind`
check (it is only assigned after the await), both destroy, and the stale one's assignment to
`adapter` can land last. The check has to come immediately after each `await`, and a
newly-created adapter must be destroyed if it turns out to be superseded.

### 4. `destroy()` before `save()` saves position 0

```ts
onBeforeUnmount(() => {
  adapter?.destroy();
  save();
});
```

The plan's own `nativeAdapter.destroy` calls `removeAttribute('src')` + `videoEl.load()`, which
resets `currentTime` to 0 and fires a `timeupdate` into `state`. `save()` then reads
`state.currentTime === 0`. Swap the order.

### 5. Dropping `stop()` breaks `mediaSession.ts`

The audit says "`stop()` never called". It is: `videoState.ts:206` passes it to `useMediaSession`,
and `MediaSessionProps` types it as `VideoState['stop']` (`mediaSession.ts:9`). Removing it from
the return is a type error at that line, and the plan never mentions `mediaSession.ts`.

A live bug is hiding here, worth fixing while in the area: `mediaSession.ts:18-24` destructures
`play, pause, setTime, onNextTrack` but **not** `stop` — so the `'stop'` action handler at line 45
calls the global `window.stop()`, aborting page loads. Either wire it up properly or drop the
handler.

---

## Correctness gaps — the change lands but breaks something else

### 6. `duration = Infinity` for live has consumers the audit missed

The audit only looked at `ControlButtons` and `Seekbar`. `duration` is also read by:

| Location                                                      | Effect with `Infinity`                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `keydownActions.ts:86`                                        | `skipInterval = Infinity`; number keys → `setTime(Infinity)`                                                 |
| `keydownActions.ts:94`                                        | `End` key → `setTime(Infinity)`                                                                              |
| `mediaSession.ts:79`                                          | `setPositionState({ duration: Infinity })` — Chrome rejects non-finite duration; fires on every `timeupdate` |
| `Seekbar.vue:56`                                              | `time = duration * percent` → `Infinity`; click-to-seek dead                                                 |
| `Seekbar.vue:135`, `Chapters.vue:11`, `SeekbarPreview.vue:73` | NaN/Infinity widths                                                                                          |
| `videoState.ts:188`                                           | `videoPlayerStore.setVideoLength(Infinity)`                                                                  |

Live works today because `duration` is set to the finite `liveSyncPosition` (`hlsAdapter.ts:85`).
The plan calls this "the current hls.js bug" — it is a hack, but it is load-bearing. The component
table claiming "2 computeds" in `Seekbar.vue` is wrong; it is 2 computeds + `onPointerMove` + 2
child props.

Recommendation: keep `duration` finite and add `live`/`liveEdge` alongside it, or introduce a
single `seekMax` accessor and route _every_ consumer through it.

### 7. The Seekbar buffer formula carries an existing bug forward unchanged

`rxPlayerAdapter.ts:135` sets `bufferLevel = position.position + position.bufferGap` — an absolute
timeline position. `Seekbar.vue:24-30` then renders `(currentTime + bufferLevel) / duration`,
double-counting `currentTime`. The plan reproduces the formula verbatim with `seekMax` swapped in.

Since `elementState.ts` is newly defining what `bufferLevel` means for every adapter, define it as
a delta (buffer ahead of playhead) or as an absolute, fix the Seekbar to match, and state which in
the `useElementState` contract. Right now the doc comment just says `timeupdate -> bufferLevel`.

### 8. Fatal errors in `Poster.vue` are invisible exactly when they matter

`Poster.vue:27` is `v-if="uiState.posterVisible.value"` — the poster is dismissed as soon as
playback starts. A mid-playback fatal error (segment load failure, the `live-ended` case, SABR
reload failure) renders into a hidden element. Use the separate `PlayerErrorOverlay.vue`, not
Poster. The `kind: 'none'` case is the only one Poster would actually cover.

### 9. `load()` always passes `startTime`, which is wrong for the case `load()` exists for

```ts
await adapter.load(src, startTime?.value ?? 0);
```

For the SABR `onReloadPlayerResponse` path — the motivating use case for `load()` over
construct-with-source — this seeks back to the video's _initial_ start time mid-playback. Reload
must resume at `state.currentTime`. Suggest `load(source, { startTime, resume?: boolean })`, or
have `videoState` pass `state.currentTime` on any non-first load.

### 10. `useProxyUrls().videoPlaybackProxy` is not the same string, and swapping it in breaks the manifest

`videoSource.ts:11` builds `${window.location.origin}/api` (no path suffix) because
`googlevideoRegex` (`utils/googlevideoRegex.ts:1`) matches only the _host_ portion —
`https://rr5---sn-x.googlevideo.com` → `https://host/api`, leaving the URL's own
`/videoplayback?...` path intact. `useProxyUrls().videoPlaybackProxy` is `${apiUrl}videoplayback`
(`composables/proxyUrls.ts:18`). Substituting it yields `/api/videoplayback/videoplayback?...` → 404. The "single source of truth" cleanup needs the two reconciled first.

### 11. The `videoplaybackProxy` runtime config is silently dropped

`videoSource.ts:12-17` lets deployments override the proxy origin via
`config.public.videoplaybackProxy` (declared in `client/nuxt.config.ts:8`). The plan's
`videoSource.ts` rewrite has no equivalent — a deployment feature disappearing without mention.

---

## Claims that do not survive checking

### 12. "Fixes the current 'adapter only instantiates in `onMounted`' bug" for next-up/playlist

`pages/watch.vue:294` renders `FlipPlayer` under `v-if="video && !videoPending"`, and the route
watcher at `watch.vue:217-226` calls `refresh()`, which flips `videoPending` — so the player
unmounts and remounts on video change today. Whatever the actual next-up symptom is, remount
already covers instantiation. `watch(source, load)` is still justified **for SABR reload**; the
plan should say so rather than resting on an unverified bug.

### 13. "3 call sites" vs. the diff

Migration step 5 says 3 video call sites + 1 audio; `QualitySelector.vue` has exactly 2 video
(lines 78, 95) + 1 audio (line 118), matching the diff. Cosmetic, but it suggests the audit and
the migration list were written from different passes.

### 14. `setVideoQuality(trackId, null)` — `trackId` is meaningless for auto

The dash sketch's `null` branch calls `unlockVideoRepresentations()` and ignores `trackId`
entirely. So selecting a different codec and then clicking "Auto" silently discards the codec
choice. Either honor `trackId` in the auto branch (`setVideoTrack` then unlock) or make the
signature `setVideoQuality(sel: { trackId, repId } | null)`.

### 15. Silent behavior changes not flagged as such

- `HEIGHT_BY_WIDTH` maps `3840: 2160`. Both current adapters map 3840 → **2560**
  (`rxPlayerAdapter.ts:216`, `hlsAdapter.ts:157`). A real bug fix, but a visible label change and
  it should be listed as one.
- The rewritten `humanizeBitrate` changes output from `5 mbps` to `5.0 Mbps` and drops the
  `< 1000 → bps` branch (`utils/humanizeBitrate.ts:2-4`).

### 16. "Pure, unit-testable" mappers

There is no unit test infrastructure in this repo — Cypress e2e only. Fine as a design property;
it is not test coverage.

---

## Smaller notes

- The dash sketch returns an object literal containing `stop`, which is not on `PlayerAdapter` — a
  TS excess-property error on a contextually-typed literal.
- `PlayerAdapter` declares `setMuted`, but `rxPlayerAdapter` has no mute method today
  (`videoState.ts:143` sets the element directly). Fine, just new work not called out.
- `useElementState` lives under `utils/` but is named `use*`. Note also that
  `utils/videoplayer/**` is **not** in Nuxt's auto-import manifest (`client/.nuxt/imports.d.ts` —
  `utils/api/*` is there, `utils/videoplayer/*` is not), so everything in the new `format.ts` /
  `mappers.ts` / `proxy.ts` needs explicit imports. Moving `humanizeBitrate` there is safe only
  because the two adapters are its sole consumers.
- `PlayerSource.hls.live` is always `true` given the branch that produces it — dead field.
- `state.live` is initialized from the DTO _and_ written by the adapter; no stated owner.
- `Player.vue:25` passes `video` as a plain object, not a `Ref`; the plan's `videoState.ts` uses
  `video.value.live`. Implicit signature change.
- `load()`'s `if (source.kind !== 'dash') return;` guards fail silently. Since the factory
  guarantees the kind, make them throw.
- `useEventListener('pagehide', save)` will not reliably complete — `saveVideoPosition` uses
  `vtFetch` (`videoState.ts:169`). Needs `keepalive: true` or `navigator.sendBeacon` to actually
  fix lost progress.
- `btoa(manifest)` (`videoSource.ts:33`) throws on non-Latin1 characters in the manifest.
  Pre-existing, but `proxy.ts` is the natural place to fix it.

---

## What is right

Keep all of these: the `PlayerAdapter` interface with `load()` separated from construction;
`elementState.ts` collapsing the triply-duplicated event wiring (and killing the `isIOSOnIPhone`
early-return at `nativeAdapter.ts:19` that skips every listener); `kind: 'none'` as an explicit
state; the `playerError` audit (verified — written in three adapters, read by zero components);
and landing steps 1–2 as a behavior-neutral refactor before touching the UI.

## Suggested resequencing

1. Steps 1 → 2 → 6 (per-adapter fixes) → 5 (component API renames) first — low-risk and
   independently valuable.
2. Rework steps 3 and 4 against findings 1–4, 9, 10, 11 before implementing.
3. Split the `live`/`liveEdge` change into its own step with a full `duration`-consumer sweep. It
   is the riskiest item in the plan and is currently sized at "2 computeds".

---

# Round 2 — review of the updated plan

Re-read of the 900-line revision, checking each claimed fix against the body of the
document rather than against its "Feedback addressed" section, plus the newly written
material.

**Verdict:** all 11 blocking/correctness items from round 1 are genuinely addressed in the
sections they touch — the fixes are correct, not merely claimed. But three of them did not
propagate to the rest of the document, one introduced a new bug, and the newly written
rx-player code has an API-level problem. Nothing here is architectural.

---

## Fixes that did not propagate

### A. The hlsAdapter sketch still contradicts Change 2

Change 2 now says `duration` stays finite, but the hls sketch is untouched:

```ts
const cleanup = useElementState(ctx.videoElementRef.value, ctx.state, {
  onEnded: ctx.onEnded,
  live: true // duration stays Infinity, liveEdge from hls
});
```

and below it, "Fixes vs. current: `duration = Infinity` for live". Two problems: the
comment and the claim contradict the resolution, and `live` was removed from
`useElementState`'s opts in the same edit (`{ onEnded, onAutoplayBlocked? }`), so this is
now also a type error.

### B. The removed `live` opt was doing real work — `useElementState` writes `Infinity` for live

The contract is now `timeupdate -> duration (finite, from videoEl.duration)`. For live that
is false: hls.js sets `mediaSource.duration = Infinity` on live playlists, and native iOS
HLS live does the same. That is precisely why `nativeAdapter.ts:65-71` explicitly filters
`duration < Infinity` today, and why `hlsAdapter.ts:85` substitutes `liveSyncPosition`. The
shared wiring reintroduces the thing Change 2 forbids, in both live adapters.

Fix: put a `live` / `durationSource` opt back, or have `useElementState` not write
`duration` at all and let each adapter own it.

### C. `seekMax` has no home

Change 2 says "in `PlayerState` or a computed in `videoState`", but `PlayerState` in
`types.ts` does not have it and the "What stays identical" return shape does not expose it.
Components only ever reach `videoState.video.*`, so migration step 5 routes six consumers
through something that exists on no surface they can see. Pick one — a derived field on
`PlayerState` is simplest — and add it to the type block.

---

## New bug introduced by a fix

### D. `hasLoadedOnce ? state.currentTime : startTime` is wrong for next-up

The comment names it explicitly:

> For reloads (next-up via source watch, SABR `onReloadPlayerResponse`), resume at the
> current playback position

Next-up is a _different video_. Resuming it at the previous video's `currentTime` is wrong —
it should start at 0, or at that video's own saved resume position. The discriminator must
be "same video, new source" (SABR reload) vs. "new video", not "have I loaded before".

There is also a tension with the plan's own #12 correction: since `watch.vue:294`'s
`v-if="!videoPending"` remounts the player on video change, `hasLoadedOnce` resets and the
branch is dead for next-up anyway. So either the branch is unreachable or it is wrong. The
comment should name only the SABR reload.

---

## New material — rx-player API issues

### E. `applyQualityCap` after the manual lock discards the user's selection

`lockVideoRepresentations(arg)` _replaces_ the locked set
(`rx-player/src/main_thread/api/public_api.ts:2647`). The manual branch locks `[repId]`,
then `applyQualityCap` locks the whole allowed-height set — so picking 720p silently
reverts to auto-within-cap. Apply the cap only in the `repId === null` branch.

### F. Splitting `setVideoTrack` + `lockVideoRepresentations` is worse than the atomic form already in use

`setVideoTrack({ trackId, switchingMode, lockedRepresentations })` does both in a single
track-store operation (`public_api.ts:2590-2627`), and `lockedRepresentations: null` means
unlocked. The plan's two calls unlock (via the bare `setVideoTrack`) and then re-lock — two
operations where one will do, with a possible extra rebuffer in between. Both branches
collapse to:

```ts
player.setVideoTrack({
  trackId,
  switchingMode: 'seamless',
  lockedRepresentations: repId ? [repId] : null
});
```

which also makes finding E disappear, since the cap then only ever applies on the unlock
path. Note both methods throw `"No content loaded"` if called before `loadVideo` — guard.

---

## Smaller items in the new text

- **Step ordering 2 vs. 6.** Step 2 has `videoState.ts` switch to
  `createAdapter(source: PlayerSource, ctx)`, but `videoSource.ts` only starts returning
  `PlayerSource` at step 6. Either move 6 ahead of 2, or have step 2 build a `PlayerSource`
  inline from today's `(source, sourceType)` pair.
- **Mount sequencing regression.** `videoState.ts:117-120` today is
  `await instantiateAdapter(); setLoop(...); setPlaybackRate(settingsStore.defaultVideoSpeed)`.
  With `onMounted(() => watch(source, load, { immediate: true }))` the load is not awaited,
  so `setPlaybackRate` hits `adapter?.` === null and the user's default speed is silently
  never applied. The sketch drops that block; it needs to run after the first successful
  load.
- **`bufferLevel = buffered.end(lastRange) - currentTime`** overstates the buffer after a
  seek, when the last range sits ahead of a gap. Use the range containing `currentTime`, and
  clamp to `>= 0`.
- **`useProxyUrls()` inside the computed getter**
  (`rewriteSabrHost(..., useProxyUrls().videoPlaybackProxy)`) creates a `computed()` via
  `useApiUrl` on every re-evaluation. Hoist it to the composable body next to `useIsIOS()`.
- **`sendBeacon` needs `new Blob([json], { type: 'application/json' })`** — a bare string
  posts as `text/plain` and Fastify will not parse it. Same-origin, so cookies are fine.
- **The SSR sentinel** returns `{ kind: 'none', reason: 'SSR' }`, which would surface as a
  user-visible fatal error string if `load` ever ran server-side. Unreachable today (the
  watch is in `onMounted`), but give it a code the overlay filters out.
- **`3840 → 2560` preserved** — right call on process. Worth noting in the follow-up that
  2560p is not a real resolution label, so the fix is display-only and safe.
- **`error` rename sequencing** — listed in step 4, but adapters start writing `state.error`
  in steps 2–3. Move the `playerError` → `error` rename into step 2 with the types.

---

## What improved

The `duration`-stays-finite reversal; the `PlayerErrorOverlay` placement in `PlayerUI.vue`
(verified — `PlayerUI.vue:51` is where `FlipPoster` sits, so a sibling works); the race
guard now after each `await` with superseded adapters destroyed; `save()` before
`destroy()`; the proxy-origin vs. proxy-path distinction with the `videoplaybackProxy`
override preserved; keeping `stop()` plus fixing the `window.stop()` bug; and the
`bufferLevel` delta contract — all correct. The line references the revision cites
(`mediaSession.ts:8/18/44/45`, `Chapters.vue:11`, `SeekbarPreview.vue:73`) all check out.

Findings A, B and D are the ones that would bite during implementation; E and F are cheap to
fix now and expensive to debug later.

---

# Round 3 — review of the 1055-line revision

All six round-2 findings (A–F) are correctly fixed in the sections they touch, and the
smaller items landed too. But two of the fixes do not work as written, one drops a guard,
and the same non-propagation pattern recurs in two places.

Two things checked and cleared, so they are not re-raised: hoisting `useProxyUrls()` to the
composable body is safe — it is already called at setup in SSR-rendered components
(`VideoEntry.vue`, `Comment.vue`, `pages/watch.vue`), so it is empirically SSR-clean. And
`setAudioTrack` does accept `lockedRepresentations` (`public_api.ts:2510`), so the audio
half of fix F is correct.

---

## Fixes that do not work as written

### 1. `seekMax` is missing from the state initializer

`PlayerState` now requires `seekMax: number`, but `reactive<PlayerState>({...})` in the
`videoState.ts` sketch lists `duration: 0` and goes straight to `volume`. Type error, and
every consumer reads `undefined` until an adapter writes it. Add `seekMax: 0`.

### 2. `watch(() => hasLoadedOnce, ...)` never fires

`hasLoadedOnce` is a plain `let` (declared alongside `adapter`, `lastKind`, `loadSeq`), not
a ref. A getter reading a non-reactive local registers no dependency, so the callback never
runs and `setPlaybackRate(settingsStore.defaultVideoSpeed)` still never executes — the exact
regression the fix was for. The sketch's own comment names the working alternative ("Simplest:
apply them inside `load()` on first load"); take it, or make `hasLoadedOnce` a `ref`.

---

## Guard dropped

### 3. The `pagehide` beacon posts history unconditionally

`saveVideoPosition` is gated on four conditions (`videoState.ts:168`):

```ts
if (settingsStore.saveVideoHistory && !embed && userStore.isLoggedIn && !video.live)
```

The new `sendBeacon` handler has none of them. As written it POSTs watch history for
logged-out users, inside embeds, on live streams, and for users who have explicitly turned
history off. That last case is the serious one — it writes data the user opted out of.
Reuse the same guard, or better, factor the guard into `saveVideoPosition` and have the
beacon path call through it.

---

## Non-propagation, again

### 4. The native adapter never sets `duration`

The `elementState` contract now says duration is adapter-owned and that "native filters
`duration < Infinity` as today (`nativeAdapter.ts:65-71`)" — but the native sketch only
calls `useElementState` and returns. There is no `timeupdate` → duration listener anywhere
in it, so with `useElementState` no longer writing duration, native playback leaves
`state.duration` at 0. The sketch needs the filtered listener the contract promises.

### 5. `load()` guards throw in two adapters and return in two

dash and hls now `throw new Error(...)`; native (`if (source.kind !== 'native') return;`)
and sabr (`if (source.kind !== 'sabr') return;`) still silently return. Round 1's response
claimed all of them now throw.

### 6. "Why `load()` instead of construct-with-source" still rests on the retracted claim

Lines 246-248: "This fixes the current 'adapter only instantiates in `onMounted`' bug and
lets SABR reload without a full component remount." That contradicts both the #12 correction
and the new comment inside `load()`, which correctly says next-up is handled by remount. Cut
the first half of the sentence; the SABR-reload justification stands on its own.

---

## The new hls.js code

### 7. `hls.liveSyncPosition` can be `null`

It is null until enough fragments are loaded to compute it. Both handlers assign it straight
into `state.duration` and `state.liveEdge`; a null duration gives NaN widths in the seekbar.
Guard with `Number.isFinite` before assigning.

### 8. No branch for a live stream that ends

When YouTube appends `ENDLIST`, `details.live` flips to `false`. `state.live` follows, but
nothing then updates `duration`, so it freezes at the last `liveSyncPosition` instead of
becoming the real VOD duration. Add an else branch reading finite `videoEl.duration`.

### 9. `duration === liveEdge` makes `seekMax` a no-op for the only live backend

The hls adapter assigns `liveSyncPosition` to both, so `seekMax = live ? liveEdge : duration`
resolves to `duration` in every case, and step 6 — "the riskiest change in the plan" — is
behavior-neutral. Genuinely good news for risk, and worth stating in the plan.

It also raises a design question: if `liveEdge` is meant to be the seekable edge, it should
probably be `seekable.end(n)` while `duration` stays at `liveSyncPosition`. Those are not the
same value — the sync position sits behind the edge by the target latency. Worth deciding
deliberately rather than by coincidence.

### 10. "Kept in sync by the adapter" spreads a derived value across every adapter

`seekMax` is a pure function of `live`/`liveEdge`/`duration`, but the plan asks each adapter
to re-derive it at each write site — hls alone has two, rx-player has `positionUpdate`, sabr
will have its own. One missed site gives a stale seekbar. Derive it once in `videoState`:

```ts
watchEffect(() => {
  state.seekMax = state.live ? (state.liveEdge ?? state.duration) : state.duration;
});
```

Adapters then maintain only the three inputs, and the field stays on the surface components
already read.

---

## Migration-order leftovers

- **Step 2 breaks the build for step 3.** Step 2 converts `videoSource.ts` to `PlayerSource`
  and drops the `sourceType` prop from `Player.vue`, but `videoState.ts` only switches to
  `createAdapter` at step 3 — in between it still has `switch (sourceType.value)`. Step 2 has
  to convert that switch to `source.value.kind` as well, or the tree does not compile between
  steps.
- **Stale cross-reference in step 1**: "visible label changes are called out in step 6" —
  after the renumbering, step 6 is the live/`liveEdge` sweep. The label changes live in the
  "Visible behavior changes to flag" section.

---

Items 1, 2 and 3 are the ones that matter: the first two are non-functional fixes that will
look like they landed, and the third writes data users opted out of. 4–6 are the same
propagation gap as last round, now down to two adapters and one rationale paragraph.
