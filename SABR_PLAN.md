# SABR player implementation plan

**Status (2026-08-27).** VOD plays through SABR; phases 1–4 and 6 have landed. Two things
are open, both YouTube-side rather than ours: videos YouTube flags for attestation stop
after about a minute (see the attestation-gate section — this is the former "readahead
wall", and it is not a bug in our request), and live has no manifest to play (phase 7).

## Background

YouTube's WEB client no longer returns `adaptive_formats` with direct segment URLs for
VOD — only a `server_abr_streaming_url` (SABR endpoint). ViewTube's server calls
`videoInfo.toDash()`, which builds a DASH manifest from those now-missing direct URLs, so
the manifest is empty/useless and rx-player can't play. VOD playback is broken.

### Livestreams — SABR applies here too (measured 2026-08-26)

**This section previously claimed live was untouched. That is no longer true.** Measured
directly against YouTube with this repo's innertube config:

| Probe                                                                 | Result                                                                                                                                                               |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hls_manifest_url` / `dash_manifest_url` on a live video              | **empty for every client** — WEB, MWEB, IOS, ANDROID, TV, TV_EMBEDDED, WEB_EMBEDDED                                                                                  |
| Same, with the hardcoded po_token removed, and with visitor_data only | still empty — not a stale-token problem                                                                                                                              |
| `adaptive_formats` on a live video                                    | present with `url` fields, but a direct GET returns **403** even with `origin`/`referer`/UA set                                                                      |
| `videoInfo.toDash()` on a live video                                  | throws: _"Generating DASH manifests for live videos is not supported. Please use the DASH and HLS manifests provided by YouTube"_ — which YouTube no longer provides |
| `server_abr_streaming_url` on a live video                            | **present**                                                                                                                                                          |

Note a methodology trap: reusing one `Innertube` instance across several `getInfo` calls
made a TV-client probe return an HLS URL once. With a fresh session per probe it does not
reproduce. Any future re-test must construct a new client per request.

So live is broken by the same root cause as VOD, and the server cannot fix it by
extracting a different field — there is no manifest to extract from any client. Live
needs the SABR path, not a separate HLS path.

**Consequence:** `hlsAdapter` / `nativeAdapter` have no source to play until either
YouTube restores live manifests or the SABR adapter is extended to live. They are kept
(the code is cheap and the manifests may return), and `videoSource.ts:52` still routes to
them the moment `hlsManifestUrl` comes back. Until then the player shows an explicit
"Live stream isn't currently playable" error (`videoSource.ts:74`) rather than buffering
forever.

### How SABR works

- Single POST per segment to the SABR URL; body is a `VideoPlaybackAbrRequest` protobuf
  (player time, buffered ranges, bandwidth estimate, preferred formats, streamer context
  with po_token).
- Response is UMP (`application/vnd.yt-ump`): a stream of varint-prefixed parts
  (`MEDIA_HEADER`, `MEDIA`, `MEDIA_END`, `FORMAT_INITIALIZATION_METADATA`,
  `NEXT_REQUEST_POLICY`, `SABR_REDIRECT`, `SABR_ERROR`, ...). Server-side ABR picks the
  actual quality.
- `@luanrt/googlevideo` provides `SabrStreamingAdapter` + `SabrUmpProcessor`, player-agnostic
  via a `SabrPlayerAdapter` interface (`getPlayerTime`, `getBandwidthEstimate`,
  `getActiveTrackFormats`, `registerRequestInterceptor`, `registerResponseInterceptor`).
- Runtime: browser + node, no node-specific deps (fetch + `@bufbuild/protobuf`).
- Reference wiring: kira → Shaka Player. Generates DASH with `toDash({ is_sabr: true })`,
  Shaka drives segment timing, intercepts each segment request → rewrites to SABR POST →
  decodes UMP → returns plain bytes to Shaka → MSE.

## Player backend decision

**Shaka Player, wrapped behind viewtube's existing adapter interface.**

### Why not rx-player

`SabrStreamingAdapter` requires `segment.getStartTime()` for every segment request (sets
`playerTimeMs`, builds buffered ranges for the server's ABR decision). rx-player's
`segmentLoader` deliberately does not expose segment start time (removed in v4.x, issue
#1563). So rx-player cannot host SABR without an upstream feature request.

### Why not custom MSE bridge

Would mean maintaining a DASH `SegmentTimeline` parser and an MSE pipeline (append
sequencing, abort/seek races, SourceBuffer quota) with no reference implementation.
Larger surface, exact fragility to avoid. Only reconsider if Shaka's trimmed-manifest
parse is still too slow in practice.

### Addressing historical Shaka slowness

The slowness was parsing a manifest with every representation and language. With SABR the
server does ABR, so the client doesn't need to track 20 video qualities:

- `representationFilter` → keep only one video + one audio representation per language,
  drop all quality duplicates and thumbnail tracks. The manifest Shaka processes becomes
  tiny.
- Enable `DASH_WASM` for the parser.
- Disable thumbnail/image AdaptationSets entirely.
- Shaka is wrapped inside `sabrAdapter.ts` (implements viewtube's adapter interface); the
  UI (`videoState.ts`, `QualitySelector.vue`, `Controls.vue`) is unchanged. Quality
  switching becomes "tell SABR your preference" rather than "switch Shaka representation."

### Fallback ladder (revised)

`SABR` (VOD **and live**, new) → `DASH`/rx-player (VOD only, when the server returns no
SABR) → `HLS`/`NATIVE` (only if YouTube starts serving live manifests again; currently
unreachable).

## Phases

Phases 1–4 and 6 have landed; VOD plays through SABR. Phase 5 is not implemented and
currently cannot be (see its status). Phase 7 (live) is unstarted and still blocked
upstream. The phase text below is kept because it records _why_ each piece is shaped the
way it is — several of the decisions cost a day to find.

### Phase 1 — Server DTO (VOD) — **done**

- `videos.service.ts`: extract deciphered `server_abr_streaming_url`,
  `adaptive_formats`, `ustreamer_config`, client context; generate the SABR DASH
  manifest with `__host` proxy params.
- Extend `VTVideoInfoDto` with a `sabr` block; `pnpm --filter=./server run gen:api`.

**The `is_sabr` flag goes in `manifest_options`, not at the top level.** In
youtubei.js 18.0.0 `DashOptions extends StreamingInfoOptions`, so `is_sabr` type-checks
as a top-level option — but `MediaInfo.toDash` only forwards `url_transformer`,
`format_filter` and `manifest_options` down to the generator, and `getStreamingInfo`
reads the flag off that last argument (`StreamingInfo.js:530-531`,
`options?.is_sabr`). Passing it at the top level type-checks, is silently ignored, and
then fails with `PlayerError: No valid URL to decipher` — because VOD
`adaptive_formats` no longer carry a `url` to decipher in the first place.

```ts
// verified working — 26 representations, 26 sabr:// BaseURLs, correct duration
const dash = await videoInfo.toDash({
  url_transformer: (url: URL) => {
    url.searchParams.append('__host', url.host);
    return url;
  },
  manifest_options: { is_sabr: true }
});
// BaseURL entries look like: <BaseURL>sabr://audio?key=140:</BaseURL>
```

### Phase 2 — Server proxy — **done**

- `/api/videoplayback`: accept POST + streaming protobuf body, forward to SABR URL,
  stream `application/vnd.yt-ump` back. Keep GET path for HLS/DASH. Rewrite SABR host →
  proxy in the DTO so the client POSTs to the proxy (CORS).

### Phase 3 — Client SABR adapter (Shaka inside) — **done**

- Add `shaka-player` + `@luanrt/googlevideo` deps.
- `sabrAdapter.ts`: owns a Shaka `Player` + `SabrStreamingAdapter`, implements viewtube's
  adapter interface.
- `sabrPlayerAdapter.ts`: implements `SabrPlayerAdapter` (delegates to Shaka + video
  element).
- Shaka config: `representationFilter` → one rep per language, drop thumbnails;
  `DASH_WASM`; request/response filters route segment POSTs through
  `/api/videoplayback` and decode UMP via `SabrUmpProcessor`.
- Map Shaka audio/video tracks → viewtube `videoTracks`/`audioTracks` so
  `QualitySelector.vue` and the language picker keep working (quality picker becomes a
  SABR preference hint).

### Phase 4 — Routing — **done**

The adapter redesign has landed, so this is smaller than originally written:
`VideoSourceType` is gone, `videoSource.ts` already returns a `PlayerSource` union with a
`sabr` variant, and `adapters/index.ts` already routes `kind: 'sabr'` (currently to the
no-op adapter). Phase 4 is now:

- `videoSource.ts`: fill in the `sabr` branch at the marked insertion point — it is
  reached whenever `video.sabr` is present, ahead of the `dashManifest` fallback.
- `adapters/index.ts`: point `case 'sabr'` at `createSabrAdapter` instead of
  `createNoopAdapter`.
- `videoState.ts` needs no change — `isSameVideoReload()` already treats a `sabr` source
  swap as a same-video reload that resumes at `state.currentTime`.

### Phase 5 — PO token (server-provided, reuse) — **not implemented, blocked**

- Server ships po_token in the `sabr` block; client reuses it in `streamer_context`.
- Implement `onReloadPlayerResponse` → re-fetch `/api/videos/:id` (server re-mints /
  returns fresh token + URL) to handle expiry.

### Phase 5 status (2026-08-27)

- po_token: **not implemented, and no token we can mint would help.** An earlier reading of
  this line said "not needed" because `npm run spike` gets media with no token and
  `streamProtectionStatus` comes back as 2 rather than 3. That was wrong twice over: the
  spike measures one request and stops, and **2 is not the safe value** — it is YouTube
  saying it wants attestation, which it enforces about a minute into playback. Videos that
  play to the end report 1.

  What is measured (see the attestation-gate section below): a BotGuard token bound to the
  session, one bound to the video, and the 10-byte cold-start token captured from a real
  Chromium session all leave the status at 2 and hit the identical cutoff. So shipping a
  token from the server would be work with no effect until someone finds what actually
  moves the status to 1. `POTOKEN_PLAN.md` carries the research and the same correction.

- `onReloadPlayerResponse`: **implemented and verified**. `reload-probe.mjs` tags the
  refetched streaming URL and confirms later segment requests carry the tag while playback
  continues uninterrupted.

### The `vb` audio variant (fixed 2026-08-27)

Some videos — `Nz9b0oJw69I`, the one `tests/cypress/e2e/3-pages/watch.cy.ts` uses — never
received a single byte of media, while others played fine. The cause was a naming
disagreement between the two libraries:

| Library                           | Audio representation id               |
| --------------------------------- | ------------------------------------- |
| youtubei.js (builds the manifest) | `itag[-audioTrackId][-drc][-vb]`      |
| googlevideo (resolves the format) | `itag[-audioTrackId][-drc]` — no `vb` |

YouTube now ships a `vb` (voice-boost) audio variant alongside the plain and `drc` ones, so
itags 140/249/250/251 each appear three times, distinguished only by `xtags`. The manifest
names one of them `140-vb`; `FormatKeyUtils.getUniqueFormatId` cannot produce that string,
so the lookup in `sabrPlayerAdapter` returned `undefined`, the SABR request went out with no
resolved audio format, and YouTube replied with directives and no media indefinitely.

Fixed by carrying `isVb` through `VTSabrFormatDto` and keying the format map with
`manifestFormatId()`, which mirrors youtubei.js's scheme. Revisit if googlevideo gains its
own `vb` support — at that point the local helper can go.

**Methodology note.** A hand-rolled "POST the same request repeatedly and see if media
arrives" probe reported 0 bytes for this video and was taken as proof that YouTube served
nothing. It reports 0 bytes for `dQw4w9WgXcQ` too, which plays perfectly — the probe never
echoes the SABR context back, so it models nothing. Any claim of the form "YouTube does not
serve this" needs a known-good video as a control in the same run.

### The error storm and the shrinking quality menu (fixed 2026-08-27)

Playback "worked" but threw dozens of `The video stream could not be loaded.` toasts and
the quality list lost entries as it went — `is8UDe2PhKQ` produced **82 toasts in 45
seconds** while the list oscillated between 2 and 6 entries. Four separate causes, all on
our side of the boundary. Measured with `npm run trace` (`scripts/sabr-probe`).

**1. Every recoverable error raised a toast.** `sabrAdapter`'s `error` listener called
`createMessage` unconditionally. Shaka reports recoverable errors it then retries and
recovers from on its own, so most of those toasts described nothing the viewer could see.
Only fatal errors are surfaced now, and only the first of a run — once the overlay is up,
Shaka keeps re-picking variants and failing again, and each attempt was adding another
toast on top of a message already on screen.

**2. Shaka disables a stream on a failed segment, and `getVariantTracks()` hides it.**
`StreamingEngine.handleStreamingError_` answers a NETWORK error by calling
`disableStream()`, which sets `variant.disabledUntilTime` on every variant using that
stream for `streaming.maxDisabledTime` (30s); `StreamUtils.isPlayable` then filters those
out of `getVariantTracks()`. The adapter rebuilt the menu from that call on every
`adaptation` event, so the menu was a live readout of Shaka's error state. It now reads
the ladder once, right after `player.load()`, and refreshes only the `active` flags.

**3. The two tracks announced different preferred formats.** `getActiveTrackFormats`
resolved the requested format through `getVariantTracks()` and took the _first_ variant
pairing with it. Variants are the cross product of the two ladders, so that partner is
arbitrary: an audio request announced `prefV=278` (the lowest video format) while the
concurrent video request announced `prefV=398`, leaving the server's ABR with two
contradictory views of one session. Worse, once a variant was disabled the lookup returned
`{}` and the request went out with no preferred formats at all — which YouTube answers with
directives and no media, failing that segment too and disabling the next variant. That is
the loop that ate the quality list. The requested format is now used verbatim and only the
_other_ side is read off the active variant, with the last known one standing in while
Shaka reports none.

**4. `bufferingGoal: 120` ran past what the server will serve.** `NEXT_REQUEST_POLICY`
asks for 15s of readahead (`targetVideoReadaheadMs`), and the server serves a bounded
amount beyond it, so a 120s goal mostly produced requests it declined — which reaches Shaka
as a failed segment, feeding causes 1 and 2. `googlevideo`'s own comment in
`addBufferingInfoToAbrRequest` says as much: _"The SABR server will only send so much
segments for a given player time."_ Now 30s. Note this is **not** what stops protected
videos a minute in; that was diagnosed later, see the attestation-gate section below.

After these: `is8UDe2PhKQ`, `Nz9b0oJw69I` and `dQw4w9WgXcQ` all play with **0 toasts**, a
stable seven-entry quality list, and ABR climbing to 1080p.

### Resolved: the "readahead wall" is YouTube's attestation gate (2026-08-27)

Some videos stopped receiving media at a fixed point — `is8UDe2PhKQ` at 63.6s,
`Nz9b0oJw69I` at 62.6s — while `dQw4w9WgXcQ` played to the end. The earlier reading of this
as a readahead or request-shape problem was wrong. It is YouTube declining the session.

**The field that says so is `STREAM_PROTECTION_STATUS`**, which every SABR response
carries and which nothing was reading:

| video         | status on every response | outcome              |
| ------------- | ------------------------ | -------------------- |
| `dQw4w9WgXcQ` | **1** (33/33 responses)  | plays to the end     |
| `is8UDe2PhKQ` | **2** (77/77 responses)  | media stops at 63.6s |

Status 2 is set from the _first_ response, before a single segment is served, so the
outcome is decided at session start and no request the client makes changes it. After
about a minute of media the server answers with policies and no media, and reports **3**
to a client that reads the whole response.

**The decisive control** is `scripts/sabr-probe/sabr-download.mjs` (`npm run download`),
which drives googlevideo's own node downloader — no Shaka, no request interceptor, no
early stream abort, none of our code:

```
is8UDe2PhKQ  threw after video=63.6s: Cannot proceed with stream: attestation required
dQw4w9WgXcQ  video=190.4s/358MB audio=179.7s/3.4MB duration=213s
```

Same second, same videos, independent implementation. That rules out every hypothesis
about our own request: the `bufferedRanges` cheat, aborting the UMP stream after the first
segment, `PLAYBACK_START_POLICY`, and `bufferingGoal`.

Two further measurements narrow what the gate wants:

- **Position is irrelevant.** A session that _starts_ at 100s (`wall-trace --start 100`)
  receives init segments and no media at all. It is not a cap on how far ahead the client
  reads; it is a budget of media per session.
- **A PO token does not lift it.** `sabr-download --token session` and `--token content`
  both hit the same 63.6s, and so does the 10-byte cold-start token captured from a real
  Chromium session (`capture-body` now prints it). The status stays 2 in all cases — if a
  token satisfied the gate it would go to 1 on the first response. `visitor_data` binding
  was verified to survive `Innertube.create`, so this is not a mis-bound token.

**What the player does now.** `SABR_ATTESTATION_REQUIRED` in `sabrPlayerAdapter.ts` is
raised when a no-media response carries a protection status above 1, and `sabrAdapter`
turns it into one message naming the real cause instead of "the video stream could not be
loaded". Measured after the change: `is8UDe2PhKQ` shows exactly one honest error at the
wall, `dQw4w9WgXcQ` shows none and plays on.

**What is still open** is what actually satisfies attestation for these videos. The
browser's request carries `clientAbrState.playbackAuthorization` (with `authorizedFormats`)
and ~45 other fields that googlevideo does not send; that is the next thing to try, and it
is a bigger piece of work than a token. Until then, protected videos play their first
minute and then say why they stopped.

### Phase 6 — Verify — **done, with one gap**

- Manual VOD playthrough (seek, quality hint, captions) through the proxy. **Language
  switching is the gap**: every video used in testing has one distinct audio track, so
  `setLanguage()` has never run against real dubbed tracks. The `vb` bug below was a
  multi-audio-variant problem, which makes this the likeliest place another one hides.
  Tracked in `TODO.md`.
- **Not** "live stream to confirm HLS untouched" — live has no HLS to confirm. Until
  phase 7 lands, the live control is: the player shows the "Live stream isn't currently
  playable" overlay promptly instead of buffering forever.
- `pnpm lint`, `pnpm build:shared`, typecheck client+server. Cypress baseline run before
  trusting red/green (specs hit live YouTube).

### Phase 7 — Livestreams — **not started, blocked upstream**

Live is blocked on manifest generation, not on the SABR transport. Measured:

- `toDash()` refuses outright for live (`MediaInfo.js:74`), before any `is_sabr`
  handling.
- Bypassing only that guard reaches the generator, which then produces an **empty**
  manifest: 417 bytes, `type="static"`, **0 representations**, 0 `sabr://` URLs,
  `mediaPresentationDuration="PTNaNS"`. The generator derives duration and segment info
  from fields live formats do not carry, so there is nothing for it to emit.

So the SABR endpoint exists for live (`server_abr_streaming_url` is present) but there is
no manifest to hand Shaka. Three options, in order of preference:

1. **Wait for upstream.** youtubei.js gains live SABR manifest generation, and phase 7
   becomes a version bump plus removing the `is_live` skip in `videos.service.ts:82`.
   Cheapest, but not on our schedule.
2. **Generate the live manifest ourselves.** Build a dynamic DASH manifest from
   `adaptive_formats` — `type="dynamic"`, `availabilityStartTime`,
   `minimumUpdatePeriod`, `timeShiftBufferDepth`, `SegmentTemplate` — and let the SABR
   adapter serve the segments. This is the "custom manifest" work the plan rejected for
   VOD, and the objection is weaker here because SABR still owns segment fetching; we
   only own the timeline. Still the largest piece of work in this document.
3. **Leave live unsupported.** Current state. The player fails honestly and immediately.

Recommended: ship phases 1–6 (VOD) first and re-probe live before committing to option
2 — YouTube's live rollout is recent and upstream is moving.

**Re-probe procedure** (a fresh `Innertube` per request — reusing one instance across
calls produced a false positive once, see the Livestreams section):

```ts
const info = await yt.getInfo(liveId); // any client
info.streaming_data?.hls_manifest_url; // → non-empty means live HLS is back
await info.toDash({ manifest_options: { is_sabr: true } }); // → throws while live is unsupported
```

Use `getBasicInfo`, not `getInfo`, when probing anything other than WEB:
`getInfo` also calls `/next`, which parses badly on several clients and throws for reasons
that say nothing about whether the stream is reachable. That mistake made every non-WEB
client look broken in one round of `client-gate.mjs`.

## Not changed

- rx-player as the non-SABR VOD fallback.
- The GET `/api/videoplayback` path for HLS/DASH segment proxying.

`hlsAdapter` / `nativeAdapter` are unchanged in code but are currently unreachable — see
the Livestreams section. They stay because they are cheap to keep behind the factory and
they become correct again the moment YouTube serves a live HLS manifest; `videoSource.ts`
already routes to them on `hlsManifestUrl` being present.
