# SABR player implementation plan

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
(the code is cheap and the manifests may return), but nothing currently routes to them.
Until then the player shows an explicit "No HLS manifest for this live stream" error
rather than buffering forever.

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

### Phase 1 — Server DTO (VOD)

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

### Phase 2 — Server proxy

- `/api/videoplayback`: accept POST + streaming protobuf body, forward to SABR URL,
  stream `application/vnd.yt-ump` back. Keep GET path for HLS/DASH. Rewrite SABR host →
  proxy in the DTO so the client POSTs to the proxy (CORS).

### Phase 3 — Client SABR adapter (Shaka inside)

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

### Phase 4 — Routing

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

### Phase 5 — PO token (server-provided, reuse)

- Server ships po_token in the `sabr` block; client reuses it in `streamer_context`.
- Implement `onReloadPlayerResponse` → re-fetch `/api/videos/:id` (server re-mints /
  returns fresh token + URL) to handle expiry.

### Phase 6 — Verify

- Manual VOD playthrough (seek, quality hint, language, captions) through the proxy.
- **Not** "live stream to confirm HLS untouched" — live has no HLS to confirm. Until
  phase 7 lands, the live control is: the player shows the "Live stream isn't currently
  playable" overlay promptly instead of buffering forever.
- `pnpm lint`, `pnpm build:shared`, typecheck client+server. Cypress baseline run before
  trusting red/green (specs hit live YouTube).

### Phase 7 — Livestreams

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

## Not changed

- rx-player as the non-SABR VOD fallback.
- The GET `/api/videoplayback` path for HLS/DASH segment proxying.

`hlsAdapter` / `nativeAdapter` are unchanged in code but are currently unreachable — see
the Livestreams section. They stay because they are cheap to keep behind the factory and
they become correct again the moment YouTube serves a live HLS manifest; `videoSource.ts`
already routes to them on `hlsManifestUrl` being present.
