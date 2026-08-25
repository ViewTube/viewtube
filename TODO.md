# TODO

## Should fix

- [ ] **Hardcoded `po_token` and `visitor_data`** in `server/src/common/innertube/innertube.ts`. Session-bound values
  baked into source and shared by every self-hosted instance. They will expire for everyone simultaneously and present
  as a YouTube outage rather than a stale constant. At minimum log loudly when falling back to the built-in values.
- [ ] **No rate limiting anywhere.** `@nestjs/throttler` is absent. The allowlist closes the SSRF but the proxies remain
  an unauthenticated bandwidth relay for Google-hosted content, through the operator's configured SOCKS proxy. It is
  also the only defence against id spam: a request for a video that does not exist costs a full innertube round trip
  (`videos.service.ts` → `client.getInfo`), and innertube calls are what attract blocks, so the cost is the instance's
  standing with YouTube rather than its cpu. Caching cannot cover that case — random ids miss every time.
  **Whatever guard goes in has to exempt the in-process SSR path.** `useVtFetch` reaches the api through
  `global.nestApp.inject()` (`client/app/composables/vtFetch.ts`), which passes through fastify's routing like any
  other request but arrives carrying `light-my-request`'s default `127.0.0.1`. Every server-rendered page on the
  instance would therefore share a single bucket and start 429ing itself under moderate traffic — the failure would
  look like YouTube breaking, not like a misconfigured limit. The `authority: 'nuxtApp'` already set on those calls is
  the hook to key the exemption off.
- [ ] **Nothing validates a video id before asking YouTube.** `/api/videos/zz` spends a full innertube round trip
  learning that a two-character id cannot exist. Playlists already reject locally — `ytpl.validateID`
  (`playlists.service.ts:18`) is why an invalid playlist id answers 400 without touching YouTube — and `isChannelId`
  (`core/channels/channel-identifier.ts:14`) exists for channels, though `getChannelInfo` still resolves a non-id
  identifier upstream before it can say no. An 11-character charset check on the video route costs nothing, holds no
  state, and removes both the cheapest form of id spam and a fair amount of accidental traffic.
- [ ] **Failures are never cached, so every bad id is a fresh upstream call.** `CacheInterceptor` stores only on the
  success path — `next.handle().pipe(tap(...))`, and `tap`'s next callback does not fire for a thrown exception — so
  the `@CacheTTL`s on every core controller do nothing for a 404. Since `ApiExceptionFilter` answers errors
  `no-store`, a shared cache in front of the instance no longer absorbs the repeats either; before it, a channel 404
  was edge-cacheable for an hour. Worth a short negative cache: 30-60s on 404 only, well under the five minute
  success TTL so a premiere going live or an unlisted video turning public is not stuck, and no more than ~10s on a
  502 or an outage outlives itself. This is an optimisation for accidental amplification — a deleted video still
  linked from a popular page, a crawler — not a defence, because the key space is attacker-controlled and filling
  redis with it is free; the defence is the rate limiting above. `CacheInterceptor` cannot be reused for it: it needs
  something that both reads on the way in and writes on the way out, so an interceptor with `catchError` rather than
  the exception filter, which only ever sees the way out.
- [ ] **`ytpl` no longer parses YouTube at all, so every playlist is a 502.** Confirmed outside the app:
  `node -e "require('ytpl')('UUuAXFkgsw1L7xaCfnd5JJOw')"` throws
  `TypeError: Cannot read properties of undefined (reading 'contents')` from inside
  `ytpl/lib/main.js` for a playlist that exists. It was invisible before the error taxonomy landed,
  because `playlists.service.ts` reported it as a 500 with an empty body; it now answers 502 and
  logs the reason. The library is unmaintained — `core/playlists` wants moving to youtubei.js like
  `channels` was, which would also give it the `has_*` probes the taxonomy prefers over catching.
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
  and if YouTube switches the tab to `postRenderer` wholesale the tab goes silently empty rather than erroring. Pass
  all three constructors to `collectFeedNodes`.
- [ ] **The legacy about branch yields `Text` nodes, not strings.** `getAboutMetadata` returns
  `ChannelAboutFullMetadata` untouched for channels YouTube still serves the old way. The field _names_ line up with
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
- [ ] **Members-only videos are not handled on the watch page.** `getInfo` on one returns
  `playability_status.status: "UNPLAYABLE"` with YouTube's upsell as the reason ("This video is available to this
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
