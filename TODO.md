# TODO

- [ ] **[high] No rate limiting anywhere.** `@nestjs/throttler` is absent; the proxies are an unauthenticated bandwidth
  relay through the operator's SOCKS proxy. Also the only defence against id spam — a non-existent video id costs a full
  innertube round trip (`videos.service.ts` → `client.getInfo`), and innertube calls are what attract blocks. Caching
  can't cover random ids.
  - Whatever guard goes in **must exempt the in-process SSR path**: `useVtFetch` reaches the api via
    `global.nestApp.inject()` (`client/app/composables/vtFetch.ts`) and arrives carrying `light-my-request`'s default
    `127.0.0.1`, so every server-rendered page would share one bucket and 429 itself under moderate traffic. The
    `authority: 'nuxtApp'` already set on those calls is the hook to key the exemption off.
- [ ] **[high] No video id validation before hitting YouTube.** `/api/videos/zz` spends a full innertube round trip
  learning that a two-character id can't exist. Playlists already reject locally (`ytpl.validateID`,
  `playlists.service.ts:18`) and `isChannelId` (`core/channels/channel-identifier.ts:14`) exists for channels. An
  11-character charset check on the video route costs nothing and removes the cheapest id spam.
- [ ] **[high] Failures are never cached, so every bad id is a fresh upstream call.** `CacheInterceptor` stores only on
  the success path (`next.handle().pipe(tap(...))`); `tap`'s next callback doesn't fire for thrown exceptions, so the
  `@CacheTTL`s on every core controller do nothing for a 404. `ApiExceptionFilter` answers errors `no-store`, so a
  shared cache in front of the instance no longer absorbs repeats either.
  - Worth a short negative cache: 30-60s on 404 only (well under the 5 min success TTL so a premiere going live or an
    unlisted video turning public isn't stuck), ~10s max on 502.
  - This is an optimisation for accidental amplification (deleted video still linked from a popular page, a crawler),
    not a defence — the key space is attacker-controlled and filling redis with it is free; the defence is rate
    limiting above.
  - `CacheInterceptor` can't be reused: needs something that reads on the way in and writes on the way out, so an
    interceptor with `catchError` rather than the exception filter (which only sees the way out).
  - Note the interceptor is `@nestjs/cache-manager`'s, not ours — there is no `CacheInterceptor` in `server/src`, only
    imports of it. Fixing this means subclassing or replacing it, not editing repo code.
- [ ] **[high] `ytpl` no longer parses YouTube, so every playlist is a 502.** Still on `ytpl@2.3.0`
  (`playlists.service.ts:8,15,22,70`); not migrated. Confirmed outside the app:
  `node -e "require('ytpl')('UUuAXFkgsw1L7xaCfnd5JJOw')"` throws
  `TypeError: Cannot read properties of undefined (reading 'contents')` from `ytpl/lib/main.js` for a playlist that
  exists. Was invisible before the error taxonomy landed (reported as 500 with empty body; now 502 with a logged
  reason). Library is unmaintained — `core/playlists` wants moving to youtubei.js like `channels` was, which would
  also give it the `has_*` probes the taxonomy prefers over catching.
- [ ] **[high] Playlist author links point at the playlist, not the channel.**
  `client/app/components/list/PlaylistEntry.vue:113` picks its link by shape:
  `typeof playlist.author === 'string'` gives `/channel/{authorId}`, anything else falls through to
  `/channel/{playlist.id}`. `VTPlaylistDto.author` is now a `VTAuthorDto`, so the second branch always fires and every
  playlist on the channel home tab links to `/channel/PLxxxxxxxx` — a hard 404. Fix is `playlist.author.id`.
  - Playlists _tab_ is unaffected (passes `hide-author`), which is why
    `tests/cypress/e2e/3-pages/channel.cy.ts` doesn't catch it — worth a home-shelf assertion once fixed.
- [ ] **[high] `/channel/<id>/channels` is a dead url.** `'channels'` was dropped from `pageNames`
  (`client/app/composables/channelPages.ts:3`) and its `swiper-slide` removed, but nothing redirects. An existing link
  leaves `currentPage = 'channels'` and `currentPageIndex = -1`, handed to swiper as `:initial-slide="-1"` — channel
  header renders over an empty body. Fall back to `'home'` when the param isn't in `pageNames`.
- [ ] **[high] Community reposts are dropped.** `channels.service.ts:528` collects only `YTNodes.BackstagePost`, and
  `Memo.getType` matches on the exact `static type` string (youtubei.js `parser/helpers.js`). Both `Post` (subclasses
  `BackstagePost`) and `SharedPost` carry different type names, so reposts never reach the community tab — and if
  YouTube switches the tab to `postRenderer` wholesale the tab goes silently empty rather than erroring. Pass all
  three constructors to `collectFeedNodes`.
- [ ] **[high] Legacy about branch yields `Text` nodes, not strings.** `getAboutMetadata` returns
  `ChannelAboutFullMetadata` untouched for channels YouTube still serves the old way. Field _names_ line up with
  `AboutChannelView` but types don't: `description`, `country`, `view_count` are `Text` instances there, plain strings
  on the new view. `toVTChannelAboutDto` puts a `Text` object into `description` and `location`,
  `sanitizeHtmlString` (`server/src/common/sanitize-html.ts`) stringifies it to `"[object Object]"`, and the client
  renders that as the location. `view_count` survives only because `parseShortenedNumber` calls `.toString()`.
  Normalise with `.toString()` on that branch. Not reachable through e2e fixtures — every channel they use is on the
  new about view.
- [ ] **[high] Captions can't distinguish two tracks that share a language code.** A video with both "English" and
  "English (auto-generated)" gives both `languageCode: 'en'`, and `captionsState.ts:57` marks a track active with
  `track.languageCode === currentTrackCode`. Selecting either lights up both in `CaptionsSelector.vue`, and the
  auto-generated track can never be selected on its own. Wants a unique per-track id rather than the language code —
  which likely means a field on the DTO, so it is not a one-liner. Reproduces on `dQw4w9WgXcQ`.
- [ ] **[high] Attestation-gated videos stop after ~1 minute and cannot currently be resumed.** YouTube marks some
  videos with `STREAM_PROTECTION_STATUS: 2` from the very first SABR response, serves roughly a minute of media, then
  answers with policies and no media indefinitely. Measured on `is8UDe2PhKQ` (63.6s) and `Nz9b0oJw69I` (62.6s); videos
  that play to the end report status 1. Reproduced by googlevideo's own node downloader (`scripts/sabr-probe`
  `npm run download`), which shares none of our code and reports _"attestation required"_ at the same second — so it
  is not our request shape, and neither `PLAYBACK_START_POLICY` nor the UMP-stream abort is involved. A BotGuard token
  bound to the session, one bound to the video, and the browser's own 10-byte cold-start token all leave the status at
  2. The player now names the cause (`SABR_ATTESTATION_REQUIRED`) instead of showing a generic error, which is where
  this rests until someone finds what moves the status to 1.
  - Next lead: `clientAbrState.playbackAuthorization` (with `authorizedFormats`), which the real web player sends and
    googlevideo does not — visible in `npm run capture`. Bigger work than a token.
  - Full working through in `SABR_PLAN.md`.
- [ ] **[low] `/api/videoplayback` logs a 500 for a normal client abort.** The SABR adapter cuts the UMP stream as soon
  as it has its segment, which reaches the proxy as `AbortError: Request aborted` and is logged by
  `ApiExceptionFilter` at ERROR level with the full googlevideo URL attached. Routine behaviour filling the log with
  noise that reads as a server fault; wants recognising as a client disconnect rather than an error.
- [ ] **[low] `manifestFormatId` in `sabrPlayerAdapter.ts` is a workaround for a googlevideo gap.** youtubei.js names
  audio representations `itag[-audioTrackId][-drc][-vb]`; googlevideo's `FormatKeyUtils.getUniqueFormatId` stops at
  `-drc`. Delete the helper if googlevideo learns about `vb`, rather than letting the two schemes drift.
- [ ] **[low] Multi-language audio switching is unverified.** `setLanguage()` has never been exercised against a video
  with real dubbed tracks — every video used in testing has exactly one distinct audio track. The `vb` bug was a
  multi-audio-variant problem, so this is the likeliest place another one hides.
- [ ] **[low] `server/src/common/proxy-allowlist.ts:12` is missing a semicolon** after `imageHostSuffixes`. ASI covers
  it so nothing is broken, but `pnpm format` will rewrite the line the moment anyone runs it.
- [ ] **[low] `proxyStream` trusts the `originUrl` query parameter** and reflects it into rewritten `.m3u8` bodies
  (`server/src/core/proxy/proxy.service.ts`). Only affects the caller's own response, so not a live vulnerability, but
  the origin should be derived server-side rather than taken from the client.
- [ ] **[high] Members-only videos not handled on the watch page.** `getInfo` on one returns
  `playability_status.status: "UNPLAYABLE"` with YouTube's upsell as the reason ("This video is available to this
  channel's members on level: … Join this channel to get access to members-only content…").
  `extractAvailability` (`server/src/mapper/converter/video-info/vt-video-info.extractors.ts`) passes that string
  through untouched, and `watch.vue:80` shows it as a generic error toast — viewer gets a call to action ViewTube
  can't fulfil, with no indication the video is members-only rather than broken. Already special-cases the
  age-restriction reason a few lines above; members-only wants the same treatment.
  - Channel listing side handled separately: lockups carry
    `metadata.metadata_rows[].badges[]` of `{ text: "Members only", style: "BADGE_MEMBERS_ONLY" }` — same signal the
    watch page could surface on an entry before the click.
  - While in there: `extractAvailability` calls `playabilityReason.includes('confirm your age')` unguarded
    (`vt-video-info.extractors.ts:138`), so a non-OK status with no reason string throws.
- [ ] **[high] `...autocomplete?q=` requests should not be sent.**
- [ ] **[low] Turn `strictNullChecks` back on.** Off in both `server/tsconfig.json` and `client/tsconfig.json`. Set in
  `🏗️ Switch to a yarn 2 monorepo (#988)`, 2021-10-15 — collateral from a build migration, never a typing decision.
  Pays off most in the extractor layer: `video.id || video.videoId || video.videoID` is exactly what the flag is for.
  Long slog; `mapper/` alone would capture most of the value.
- [ ] **[low] Drop `| any` from a converter signature.** One instance left:
  `toVTVideoDto = (video: VideoSourceApproximation | any)` (`mapper/converter/video/vt-video.converter.ts:29`). The
  union collapses to `any` and disables checking at precisely the boundary the ~2400 lines of
  `*-source-approximation.ts` were written to protect. A one-line fix now that the rest have gone.
- [ ] **[low] `dashjs` is a dependency nothing imports.** `client/package.json:32` pins `dashjs@5.2.1`; grep over
  `client/app` finds no import — the DASH path is rx-player (`dashAdapter.ts`). Left over from an earlier player.
  `knip` does not catch it because the client workspace is excluded (`knip.json`). Drop it, or bring the client into
  `knip`'s reach so the next one is caught automatically.
- [ ] **[low] `metadata.ts` churns nondeterministically.** Every `nest build` reorders string-literal union members
  (`["none","skip"]` <-> `["skip","none"]`), so this tracked generated file produces spurious diffs on every build.
  Either sort it post-generation or stop tracking it and generate in CI.
- [ ] **[low] Largest files, where bugs will be**: `client/app/utils/webVTTParser.ts` (782, hand-rolled),
  `client/app/pages/watch.vue` (768), `client/app/components/list/VideoEntry.vue` (653).
- [ ] **[low] `CHANGELOG.md` has lapsed** — nothing since 0.17.0 (`#2940`) while `package.json` is 0.17.1, and it still
  feeds the release job (`moisout/changelog-create-release`). Either resume it or decide it's retired.
- [x] **[scale] ~~Remove the hardcoded `po_token` / `visitor_data`~~** — done 2026-08-27, along with the `[high]`
  duplicate of the same entry. `VIEWTUBE_PO_TOKEN` / `VIEWTUBE_VISITOR_DATA` remain as a manual override.
  - **The "no `po_token` is needed" conclusion first recorded here was wrong**; corrected in the attestation entry
    above. It rested on `npm run spike`, which sends one request per case, and YouTube's attestation gate does not
    close until about a minute of media has been served. `streamProtectionStatus: 2` is that gate arming, not the
    safe value. A token-generating sidecar would still not help today — no token yet tried opens the gate — but the
    reason is "nobody knows what satisfies it", not "the token is never checked". `POTOKEN_PLAN.md` carries the
    research with the same correction on it.
- [ ] **[scale] Record the deployment topology.** The public instance ran the container inside gluetun for VPN
  egress, no proxy. Nothing in the repo says so — not the compose files, not the README, not `env.validation.ts`.
  That knowledge existed only in the operator's head, which makes picking the project back up after a pause needlessly
  expensive. A `docker-compose.public.yml` or a README section would fix it permanently.
- [ ] **[scale] `VIEWTUBE_PROXY_URL` is undocumented and unvalidated.** Read straight from `process.env` in
  `proxyAgent.ts`, absent from `env.validation.ts` and from every doc. Add it to the Joi schema if the proxy path is
  revived.
- [ ] **[scale] `useProxy` is a boolean where an egress policy belongs.** All ten call sites pass `useProxy: true` —
  `innertubeFetch`, autocomplete, the subscription poller, thumbnails _and_ `videoplayback` — against a single global
  proxy URL. These workloads have opposite requirements: streams and thumbnails are bulk bandwidth and
  latency-sensitive, innertube calls and the poller are what actually attract blocks. Reviving a rotating proxy means
  splitting this into a per-call-site policy (`direct` / `rotating`) rather than one dial.
  - Inert on the current deployment — with `VIEWTUBE_PROXY_URL` unset, `proxyEnabled()` is false and every
    `useProxy: true` is a no-op, so all egress goes out through whatever the container's network provides. Only
    relevant if a rotating proxy is reintroduced.
- [ ] **[scale] Agent pool constant mismatch** in `server/src/common/proxyAgent.ts`: `proxyAgentUses = 100` bounds
  cleanup, but reuse requires `usages < 10`. Once every pooled agent for a URI passes 10 uses, a fresh `ProxyAgent` is
  allocated per request and none are closed until one reaches 100. Invisible at low traffic, continuous churn at
  scale. Given the commit was `✨ Store proxyAgents temporarily (#2901)`, the 10-vs-100 gap looks unintentional.
  - Inert on the current deployment (see above).
- [wontfix] **In-process SSR via `global.nestApp.inject()`.** Skips a loopback round trip; the cost is that the
  client can't be deployed separately from the server. Correct for a single-container product, but a one-way door.
- [wontfix] **Admin settings pushed into `process.env.NUXT_PUBLIC_*` at boot.** Toggling registration needs a
  restart. Fine, just not obvious.
- [wontfix] **`core/proxy` and the tsconfig strictness flags are pre-2023 code.** Read as legacy to be corrected,
  not as patterns to imitate elsewhere.
