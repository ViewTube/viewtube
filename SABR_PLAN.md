# SABR player implementation plan

## Background

YouTube's WEB client no longer returns `adaptive_formats` with direct segment URLs for
VOD — only a `server_abr_streaming_url` (SABR endpoint). ViewTube's server calls
`videoInfo.toDash()`, which builds a DASH manifest from those now-missing direct URLs, so
the manifest is empty/useless and rx-player can't play. VOD playback is broken.

### Livestreams

SABR is VOD-only. Live and post-live-DVR streams still serve standard HLS/DASH manifests
(`hls_manifest_url` / `dash_manifest_url`). Confirmed by kira's README, LibreTube's SABR
PR, yt-dlp (SABR-for-live is an experimental off-by-default flag), and youtubei.js
(refuses to generate DASH for live, points to `hls_manifest_url`).

**ViewTube's existing `hlsAdapter` / `nativeAdapter` for live stays as-is.**

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

### Fallback ladder (unchanged)

`SABR` (VOD, new) → `DASH`/rx-player (VOD when server returns no SABR, e.g. `tv` client)
→ `HLS`/`NATIVE` (live, untouched).

## Phases

### Phase 1 — Server DTO

- `videos.service.ts`: extract deciphered `server_abr_streaming_url`,
  `adaptive_formats`, `ustreamer_config`, client context; generate SABR DASH via
  `toDash({ is_sabr: true, url_transformer })` with `__host` proxy params.
- Extend `VTVideoInfoDto` with a `sabr` block; `pnpm --filter=./server run gen:api`.

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

- `videoSource.ts`: add `SABR` to `VideoSourceType`; select `SABR` when `video.sabr`
  present and not live/post-live; keep `HLS`/`NATIVE` for live; fall back to `DASH`
  (rx-player) when `sabr` absent.
- `videoState.ts` instantiates `sabrAdapter`.

### Phase 5 — PO token (server-provided, reuse)

- Server ships po_token in the `sabr` block; client reuses it in `streamer_context`.
- Implement `onReloadPlayerResponse` → re-fetch `/api/videos/:id` (server re-mints /
  returns fresh token + URL) to handle expiry.

### Phase 6 — Verify

- Manual VOD playthrough (seek, quality hint, language, captions) through the proxy; live
  stream to confirm HLS untouched.
- `pnpm lint`, `pnpm build:shared`, typecheck client+server. Cypress baseline run before
  trusting red/green (specs hit live YouTube).

## Not changed

- Live HLS path (`hlsAdapter` / `nativeAdapter`).
- rx-player as the non-SABR VOD fallback.
- The GET `/api/videoplayback` path for HLS/DASH segment proxying.
