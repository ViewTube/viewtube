# TODO

Findings from a code review pass on 2026-08-24, kept here so they survive between sessions. Ordered by whether they can
hurt someone, not by effort. Nothing here is a rewrite request — the architecture is sound; these are specific loose
ends.

Where a finding has an archaeological explanation it is noted, because it changes the fix. Much of what looks careless
is sediment from the migration off invidio.us: the project started 2019-07-18 as an Invidious frontend and grew its own
scraping layer around 2023 (`mapper/` first appears in
`✨ Switch to youtube homepage (#1760)`, 2023-02-27). Code written before that boundary assumed a trusted,
operator-configured upstream. Code written after it assumes YouTube is hostile. The two halves have different threat
models and it shows.

## Should fix

- [ ] **`pipe(reply.raw)` probably discards the controller's headers.** All three proxy success paths pipe to
  `reply.raw`, bypassing Fastify's send lifecycle, so `@Header('Cache-Control', ...)` and
  `@Header('Content-Type', ...)` on `ProxyController` may never reach the wire. If so, every thumbnail is being
  refetched instead of browser-cached — worth measuring before optimising anything else about image loading.
- [ ] **Hardcoded `po_token` and `visitor_data`** in `server/src/common/innertube/innertube.ts`. Session-bound values
  baked into source and shared by every self-hosted instance. They will expire for everyone simultaneously and present
  as a YouTube outage rather than a stale constant. At minimum log loudly when falling back to the built-in values.
- [ ] **No rate limiting anywhere.** `@nestjs/throttler` is absent. The allowlist closes the SSRF but the proxies remain
  an unauthenticated bandwidth relay for Google-hosted content, through the operator's configured SOCKS proxy.
- [ ] **No global `ExceptionFilter`.** For an app whose defining condition is upstream breakage, error handling is
  entirely ad hoc — a single filter would give consistent shapes and one place to log.
- [ ] **SSR turns every api error into fake data.** `useVtFetch`'s in-process branch
  (`client/app/composables/vtFetch.ts:78`) returns `destr(response.body)` from `nestApp.inject()` without looking at
  `response.statusCode`, so a 4xx/5xx body is handed back as though it were a successful payload. `useLazyAsyncData`
  then resolves with `data` set to `{ message, description }` and `error` null, and any `v-if="data"` in the page
  passes. On a channel that does not exist this renders a full skeleton channel page — fallback banner, tab menu, empty
  home — instead of an error, which is what
  `tests/cypress/e2e/3-pages/channel.cy.ts` has an `it.skip` waiting on. The browser path is fine: `ofetch.raw` throws
  on non-2xx, so this is SSR-only and shows up on first load but not on client-side navigation. The fix is to throw
  when `statusCode >= 400`, but it changes error behaviour on every SSR-rendered page at once, so it wants doing
  deliberately — ideally together with the global `ExceptionFilter` above.
- [ ] **Apply the channels error taxonomy to `videos` and `playlists`.** `core/channels` is being converged on three
  outcomes: `NotFoundException({ message, description })` for something youtube does not have, `BadGatewayException`
  for youtube reachable but unusable (a rejected token, a renderer the mapper can no longer read), and
  `BadRequestException` only for a genuinely malformed argument — with one `channel-errors.ts` owning the shapes,
  `debug`/`warn`/`error` picked by which of the three is in play, and tab presence asked through youtubei.js's `has_*`
  getters (`parser/youtube/Channel.js`) instead of inferred from a caught `InnertubeError`. The other two core services
  predate that and disagree with it in both directions:
  - `videos.service.ts:114-121` funnels every `getInfo` failure into a 500, so a deleted or private video reports as a
    server fault, and it copies `error.message` / `error.info.reason` — raw youtubei.js text — into the response body.
    `:58` passes the error _object_ itself to `InternalServerErrorException`, as do
    `playlists.service.ts:24` and `:45`.
  - `playlists.service.ts:10` answers an invalid playlist id with a 500 where 400 belongs, and the fall-through
    `throw new InternalServerErrorException('Error fetching playlist')` at `:27` and `:53` is really a 404.
  `playlists` is still on `ytpl` rather than youtubei.js, so only the taxonomy carries over — there is no `has_*`
  equivalent to probe with, and its catches stay catches. Worth doing alongside the global `ExceptionFilter` above
  rather than before it: the filter gives one place to log and one response shape, the taxonomy decides which shape
  each failure earns.
- [ ] **Playlist author links point at the playlist, not the channel.**
  `client/app/components/list/PlaylistEntry.vue:113` picks its link by shape:
  `typeof playlist.author === 'string'` gives `/channel/{authorId}`, anything else falls through to
  `/channel/{playlist.id}`. `VTPlaylistDto.author` is now a `VTAuthorDto`, so the second branch always fires and every
  playlist on the channel home tab links to `/channel/PLxxxxxxxx`, which is a hard 404. Fix is `playlist.author.id`.
  The Playlists _tab_ is unaffected because it passes `hide-author`, which is also why
  `tests/cypress/e2e/3-pages/channel.cy.ts` does not catch it — worth a home-shelf assertion once fixed.
- [ ] **`/channel/<id>/channels` is a dead url.** `'channels'` was dropped from `pageNames`
  (`client/app/composables/channelPages.ts:3`) and its `swiper-slide` removed, but nothing redirects. An existing link
  or bookmark leaves `currentPage = 'channels'` and `currentPageIndex = -1`, which is handed to swiper as
  `:initial-slide="-1"`, and no page component matches — so the channel header renders over an empty body. Falling back
  to `'home'` when the param is not in `pageNames` fixes it.
- [ ] **Community reposts are dropped.** `channels.service.ts:528` collects only `YTNodes.BackstagePost`, and
  `Memo.getType` matches on the exact `static type` string (youtubei.js `parser/helpers.js`). Both `Post` — which
  subclasses `BackstagePost` — and `SharedPost` carry different type names, so reposts never reach the community tab,
  and if youtube switches the tab to `postRenderer` wholesale the tab goes silently empty rather than erroring. Pass
  all three constructors to `collectFeedNodes`.
- [ ] **The legacy about branch yields `Text` nodes, not strings.** `getAboutMetadata` returns
  `ChannelAboutFullMetadata` untouched for channels youtube still serves the old way. The field _names_ line up with
  `AboutChannelView` but the types do not: `description`, `country` and `view_count` are `Text` instances there and
  plain strings on the new view. So `toVTChannelAboutDto` puts a `Text` object into `description` and `location`,
  `sanitizeHtmlString` (`server/src/common/sanitize-html.ts`) stringifies it to `"[object Object]"`, and the client
  renders that as the location. `view_count` survives only by accident, because `parseShortenedNumber` calls
  `.toString()`. Normalise with `.toString()` on that branch. Not reachable through the e2e fixtures — every channel
  they use is on the new about view.
- [ ] **`server/src/common/proxy-allowlist.ts:12` is missing a semicolon** after `imageHostSuffixes`. ASI covers it, so
  nothing is broken, but `pnpm format` will rewrite the line the moment anyone runs it.
- [ ] **`proxyStream` trusts the `originUrl` query parameter** and reflects it into rewritten `.m3u8`
  bodies (`server/src/core/proxy/proxy.service.ts`). Only affects the caller's own response, so it is not a live
  vulnerability, but the origin should be derived server-side rather than taken from the client.
- [ ] **`proxyText` has no error handling at all**, now inconsistent with its two neighbours.
- [ ] **Members-only videos are not handled on the watch page.** `getInfo` on one returns
  `playability_status.status: "UNPLAYABLE"` with youtube's upsell as the reason ("This video is available to this
  channel's members on level: … Join this channel to get access to members-only content and other exclusive perks.").
  `extractAvailability`
  (`server/src/mapper/converter/video-info/vt-video-info.extractors.ts`) passes that string through untouched, and
  `watch.vue:80` shows it as a generic error toast — so the viewer gets a call to action ViewTube cannot fulfil, with no
  indication that the video is members-only rather than broken. It already special-cases the age-restriction reason a
  few lines above; members-only wants the same treatment: detect it, set an explicit reason, and let the page say so
  plainly. The channel listing side of this is being handled separately — lockups carry
  `metadata.metadata_rows[].badges[]` of `{ text: "Members only", style: "BADGE_MEMBERS_ONLY" }`, which is the same
  signal the watch page could surface on an entry before the click.
- [ ] **...autocomplete?q=** requests should not be sent

## Worth doing when there's appetite

- [ ] **Turn `strictNullChecks` back on.** Off in both `server/tsconfig.json` and
  `client/tsconfig.json`. _Context: set in `🏗️ Switch to a yarn 2 monorepo (#988)`, 2021-10-15 — collateral from a build
  migration, never a typing decision._ This is the codebase where it pays most: the extractor layer exists to survive
  missing fields, and
  `video.id || video.videoId || video.videoID` is exactly what the flag is for. Long slog;
  `mapper/` alone would capture most of the value.
- [ ] **Drop `| any` from the converter signatures**, e.g.
  `toVTVideoDto = (video: VideoSourceApproximation | any)`. The union collapses to `any` and disables checking at
  precisely the boundary the ~2400 lines of `*-source-approximation.ts` were written to protect.
- [ ] **`metadata.ts` churns nondeterministically.** Every `nest build` reorders string-literal union members
  (`["none","skip"]` <-> `["skip","none"]`), so this tracked generated file produces spurious diffs on every build.
  Either sort it post-generation or stop tracking it and generate in CI.
- [ ] **Vendored `yt-channel-info`** (2149 lines under `server/src/core/channels/yt-channel-info/`)
  is unowned code inside the tree, outside the `mapper/` conventions and outside `knip`'s reach. Probably the right
  pragmatic call given upstream's state — just know it is there.
- [ ] **Largest files, where bugs will be**: `client/app/utils/webVTTParser.ts` (782, hand-rolled),
  `client/app/pages/watch.vue` (768), `client/app/components/list/VideoEntry.vue` (653).
- [ ] **`CHANGELOG.md` has lapsed** — nothing since 0.17.0 (`#2940`) while `package.json` is 0.17.1, and it still feeds
  the release job (`moisout/changelog-create-release`). Either resume it or decide it is retired.

## Public instance / scale

Only relevant to running the public instance; none of this bites a self-hoster.

- [ ] **Remove the hardcoded `po_token` / `visitor_data`** from
  `server/src/common/innertube/innertube.ts`. These are leftovers from testing the env-var support added for a
  self-hoster, not intended defaults — but they are the values every instance uses unless overridden, so they ship as a
  shared fingerprint. Delete them and warn loudly at startup when none are configured. **Open question that gates
  everything else: does ViewTube still function with no `po_token` at all?** The answer decides whether a public
  instance needs a token-generating sidecar or just documentation.
- [ ] **Record the deployment topology.** The public instance ran the container inside gluetun for VPN egress, no proxy.
  Nothing in the repo says so — not the compose files, not the README, not
  `env.validation.ts`. That knowledge existed only in the operator's head, which makes picking the project back up after
  a pause needlessly expensive. A `docker-compose.public.yml` or a README section would fix it permanently.
- [ ] **`VIEWTUBE_PROXY_URL` is undocumented and unvalidated.** Read straight from `process.env` in
  `proxyAgent.ts`, absent from `env.validation.ts` and from every doc. Add it to the Joi schema if the proxy path is
  revived.

### Only if a rotating proxy is reintroduced

Both of these are inert on the current deployment — with `VIEWTUBE_PROXY_URL` unset,
`proxyEnabled()` is false and every `useProxy: true` is a no-op, so all egress goes out through whatever the container's
network provides.

- [ ] **`useProxy` is a boolean where an egress policy belongs.** All ten call sites pass
  `useProxy: true` — `innertubeFetch`, autocomplete, the subscription poller, thumbnails _and_
  `videoplayback` — against a single global proxy URL. These workloads have opposite requirements: streams and
  thumbnails are bulk bandwidth and latency-sensitive, innertube calls and the poller are what actually attract blocks.
  Reviving a rotating proxy means splitting this into a per-call-site policy (`direct` / `rotating`) rather than one
  dial.
- [ ] **Agent pool constant mismatch** in `server/src/common/proxyAgent.ts`: `proxyAgentUses = 100`
  bounds cleanup, but reuse requires `usages < 10`. Once every pooled agent for a URI passes 10 uses, a fresh
  `ProxyAgent` is allocated per request and none are closed until one reaches 100. Invisible at low traffic, continuous
  churn at scale. Given the commit was
  `✨ Store proxyAgents temporarily (#2901)`, the 10-vs-100 gap looks unintentional.

## Deliberate — leave alone

- **In-process SSR via `global.nestApp.inject()`.** Skips a loopback round trip; the cost is that the client cannot be
  deployed separately from the server. Correct for a single-container product, but it is a one-way door.
- **Admin settings pushed into `process.env.NUXT_PUBLIC_*` at boot.** Means toggling registration needs a restart. Fine,
  just not obvious.
- **`core/proxy` and the tsconfig strictness flags are pre-2023 code.** Read them as legacy to be corrected, not as
  patterns to imitate elsewhere.
