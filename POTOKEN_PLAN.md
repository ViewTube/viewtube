# PO token implementation plan

> [!IMPORTANT]
> **Read this before the phase 0 section below, which draws a conclusion that is too
> strong.** Phase 0 established that the 403 was two bugs in our own code, not attestation
> — that part holds. It went on to say the PO token "is not currently a gate", and that is
> wrong: `npm run spike` sends **one** request per case and stops, and YouTube's
> attestation gate does not close until roughly a minute of media has been served. On
> videos it marks with `STREAM_PROTECTION_STATUS` 2 the gate is real and playback stops
> there. See the attestation-gate section of `SABR_PLAN.md`.
>
> What is _also_ true, and measured (2026-08-27): a BotGuard-minted token does not open
> that gate either — session-bound, content-bound, or the 10-byte cold-start token lifted
> from a real Chromium session all leave the status at 2 and hit the identical wall
> (`scripts/sabr-probe/sabr-download.mjs --token`). So implementing the phases below is
> still not a fix for anything _today_; the difference is that the gate exists and is not
> understood, rather than not existing. Anyone reviving this plan should first find a token
> that moves `STREAM_PROTECTION_STATUS` from 2 to 1 — that is the cheap, decisive test, and
> nothing here works without it.
>
> A second, separate gate appeared the same day: `getInfo` answering `LOGIN_REQUIRED` /
> "Sign in to confirm you're not a bot" for most videos from a flagged IP. That one is not
> a token problem either (`scripts/sabr-probe/login-gate.mjs` shows every token strategy
> failing identically, and `client-gate.mjs` shows every innertube client failing
> identically) — it is the address, and it cleared by moving to a different exit.

## Phase 0 results (2026-08-27)

`scripts/sabr-probe/potoken-spike.mjs` (`npm run spike`) runs one BotGuard attestation,
keeps the minter, and tests two axes independently — the token on the `player` request and
the token in the SABR body:

```
attestation:  198ms   ttl=43200s  refreshThreshold=100
2 mints from the same minter: 1ms  (session 796ch, content 116ch)

case                                 cfg    result
1 no token anywhere                  1251b  200  SABR_CONTEXT_UPDATE SNACKBAR_MESSAGE NEXT_REQUEST_POLICY
2 player=content, gvs=none           1251b  200  (identical)
3 player=none, gvs=content           1251b  200  (identical)
4 player=content, gvs=content        1251b  200  (identical)
5 session-bound only (Piped style)   1259b  200  (identical)
```

Every case returns 200, **including case 1 with no token at all**, and all five are
byte-identical. The PO token does not gate the _first_ request on this path.

> The original sentence here was "The PO token is not currently a gate on this path", full
> stop, and that is the error this document's header warns about. Five one-request cases
> cannot show a token is irrelevant to a session that YouTube cuts off a minute in. On
> videos flagged with `STREAM_PROTECTION_STATUS` 2 it does gate playback — just not in a
> way any token measured so far unlocks. `npm run download` is the probe with the right
> time horizon for this question.

Two incidental confirmations: attestation costs ~200 ms and two mints from the kept minter
cost **1 ms**, which is the "per-video minting is cheap" claim measured; and the integrity
token TTL is 12 h (43200 s), matching the low end of yt-dlp's estimate.

### What the 403 actually was

Two bugs, both mine, both in code added while building SABR support.

**1. `Platform.shim.eval` threw on every call.** `server/src/common/innertube/innertube.ts`
ran the player script with `vm.runInNewContext(data.output)`. `data.output` is a function
_body_ ending in `return`, which is a syntax error at the top level of a script — youtubei.js
documents `new Function(data.output)()` for exactly this reason. Every call threw _"Illegal
return statement"_, so the SABR URL kept its scrambled `n` parameter and YouTube answered 403. `sabr.builder.ts` treats deciphering as best-effort and logged a warning, so this
degraded quietly instead of failing loudly. Fixed by wrapping the body in an IIFE, which
keeps the `vm` sandbox.

This also explains the "browser session works, server session doesn't" evidence that
motivated this plan: the browser was deciphering correctly and we were not. It was never
about session provenance.

**2. The videoplayback proxy emitted invalid HTTP.** `videoplayback.service.ts` forwarded
`content-length` unconditionally. A SABR response is chunked and has none, so Fastify
serialised `undefined` into an _empty_ `Content-Length` header. Node's client rejected it
with _"Response does not match the HTTP/1.1 protocol (Empty Content-Length)"_ and Chromium
dropped it as `net::ERR_ABORTED` before any handler ran — which is why the player showed a
spinner and no error. The legacy GET path always had a content-length, so this only
surfaced on SABR. Fixed by forwarding only headers that are actually present.

### Verified end to end

`scripts/sabr-probe/viewtube-playback.mjs` against the real app, two videos:

```
video element: {"currentTime":24.9,"readyState":4,"paused":false,"buffered":147.3,"error":null}
/api/videoplayback calls: 53  ->  POST 200 application/vnd.yt-ump
PLAYING — SABR works end to end in ViewTube.
```

### What this means for the phases below

- **Nothing here is required for playback.** Do not implement phases 1–6 to fix a 403.
- **Done:** the stale hardcoded `po_token` / `visitor_data` literals are removed from
  `innertube.ts`. They were bound to a `visitorData` from whenever they were captured and
  were presented on every request — strictly worse than sending nothing. Playback is
  verified working with no token at all; `VIEWTUBE_PO_TOKEN` / `VIEWTUBE_VISITOR_DATA`
  remain as a manual override for pinning a real pair.
- **Keep in reserve.** yt-dlp's enforcement table still lists GVS as required for `web`,
  and YouTube is actively rolling this out. The research below, the measured costs, and the
  spike are what makes implementing this a short job if enforcement reaches us. Re-run
  `npm run spike` first — if case 1 stops returning 200, the plan is live again.
- **Done:** `composables/videoplayer/mediaSession.ts` threw
  `setPositionState: position cannot be greater than duration` on short videos. `seekMax`
  legitimately trails `currentTime` (it is 0 until the adapter reports a duration, and on
  live it tracks an edge the playhead rounds past), so the position is now clamped and the
  call skipped until a duration exists.

## Why this document was written

SABR playback returned **403** on every segment request, and a field-by-field bisect
against a real browser capture had ruled out every visible difference in `clientAbrState`,
`clientInfo` and the format list. The remaining hypothesis was the _provenance of the
session_, with PO tokens as the mechanism YouTube uses to tell those apart. Phase 0 was
written to test that hypothesis before building on it, and it turned out to be wrong.

## Background: what a PO token actually is

A Proof-of-Origin token is a blob produced by an attestation provider — BotGuard on Web,
DroidGuard on Android, iOSGuard on iOS. Tokens are not portable across platforms.

yt-dlp's guide splits the requirement into three cases:

| Case       | What it covers                                        |
| ---------- | ----------------------------------------------------- |
| **GVS**    | Google Video Server requests — the actual media bytes |
| **Player** | Innertube `player` requests that return format URLs   |
| **Subs**   | Subtitle requests                                     |

And per client (abridged from the guide's enforcement table):

| Client | PO token required for | Notes                             |
| ------ | --------------------- | --------------------------------- |
| `web`  | Subs, **GVS**         | **Only SABR formats available**   |
| `mweb` | GVS                   |                                   |
| `tv`   | not required          | all formats DRM'd without cookies |
| `ios`  | GVS or Player         | account cookies not supported     |

ViewTube uses `WEB`. That row is exactly our situation: SABR-only _and_ GVS token required.
The 403 is the documented failure mode.

### "Does YouTube require a new token per video?"

Yes — and this is the part that sounds worse than it is.

> PO Tokens have a "content binding", meaning they are bound to the user session (Visitor
> ID or account Session ID) or to the video ID. Most PO Tokens (such as for `web`
> GVS/Player) are bound to the video ID, so a new token is required for each video.
> — yt-dlp PO Token Guide

The critical thing the wiki does not spell out is that **minting a token is not the
expensive part**. The work splits in two:

1. **Attestation** (expensive, ~1–3 s, needs network + a DOM + running YouTube's
   obfuscated BotGuard interpreter) → produces an **integrity token**, valid for hours.
2. **Minting** (cheap, local, no network) → a `WebPoMinter` built from that integrity
   token stamps out an unlimited number of tokens, each bound to whatever string you give
   it: a visitor ID, a video ID, or a data sync ID.

So "a new token per video" costs a local function call, not a new attestation. You run
BotGuard once per session and mint per video from the result. This is the single most
important fact for the design, and it is why "per-video tokens" is not a scaling problem.

### Two tokens, one integrity token

| Token       | Content binding | Used for                                                                    |
| ----------- | --------------- | --------------------------------------------------------------------------- |
| **Session** | `visitorData`   | `Innertube.create({ po_token, visitor_data })` — signs non-SABR stream URLs |
| **Content** | `videoId`       | the `player` request, and the SABR request body                             |

Both come from the same minter.

## How other projects handle it

**Invidious (via `invidious-companion`)** — the closest working reference, and the one
worth copying. Its architecture:

- BotGuard runs in a **Worker thread**, with `jsdom` providing `window` / `document` /
  `navigator`.
- On init the worker mints a **session token** bound to `visitorData` and hands
  `{ sessionPoToken, visitorData }` back to the main thread, which builds the Innertube
  client from that pair.
- The worker keeps the minter alive and answers `content-token-request` messages by video
  ID (`minter.mintAsWebsafeString(videoId)`), one per video.
- The content token goes into the player request as
  `serviceIntegrityDimensions.poToken`.
- A new token is **validated before it is trusted**: search for videos, fetch a player
  response, `HEAD` the first format URL, require 200/206. Only then are the previous
  workers terminated and the new client swapped in.
- Regeneration runs on a cron; token generation is kicked off in the background at boot
  with exponential-backoff retry so startup is never blocked.

**NewPipe / PipePipe / LibreTube** — same two-tier idea, different attestation host. They
mint the token in a real Android **WebView**, because a WebView is a genuine browser engine
and passes BotGuard's checks for free. PipePipe's docs draw the line explicitly: the
extractor owns the SABR protocol (builds the `VideoPlaybackAbrRequest`, POSTs it, decodes
UMP), and the client app "supplies the one thing the extractor can't produce: a PO token
(minted in a WebView)". The known failure mode is instructive — on GMS-less Huawei devices
the system WebView is too old to run the BotGuard challenge and silently yields an invalid
token rather than an error.

**yt-dlp** — declines to solve it in core. It defines a provider plugin interface and
delegates to `bgutil-ytdlp-pot-provider` (BgUtils, i.e. the same library Invidious uses) or
`yt-dlp-getpot-wpc` (drives a real browser). Manual token extraction is explicitly no
longer recommended, precisely because of the per-video binding.

**Piped (Kavin / TeamPiped)** — the outlier, and worth reading precisely because it does
_not_ follow the pattern above. Piped-Backend has no BotGuard code at all; it POSTs to a
separate microservice named by the `BG_HELPER_URL` config key.

That service, [`TeamPiped/bg-helper-server`](https://github.com/TeamPiped/bg-helper-server),
is 55 lines of Bun + Elysia that does `jsdom` + `bgutils-js` and exposes one route:

```ts
POST /generate  { visitorData, requestKey }  →  { poToken, visitorData }
```

Three things about it matter for us:

- It pins **`bgutils-js@^3.2.0`**, whose API (`BG.Challenge.create` / `BG.PoToken.generate`)
  runs the _entire attestation_ per call and returns a single token. There is no reusable
  `WebPoMinter` — that arrived in 4.x. So Piped cannot mint cheaply, and every token costs
  a full BotGuard run.
- Because of that, it binds to **`visitorData` only**. `BgPoTokenProvider.getWebClientPoToken(String videoId)`
  takes a video ID and **never reads it**. This is the pre-content-binding design that
  yt-dlp's guide describes as no longer sufficient for `web`.
- To make the expense survivable, the backend keeps a `ConcurrentLinkedQueue` of tokens and
  recycles each one back into the pool after 10–15 randomised seconds. That is a workaround
  for the missing minter, not a cache.

And the detail that decides it for us: Piped constructs
`new PoTokenResult(visitorData, poToken, null)`. NewPipeExtractor's third field is
`streamingDataPoToken` — "the poToken to be appended to streaming URLs … may be required
on some clients such as HTML5 ones". Piped passes `null`. **It supplies a player token and
no GVS token whatsoever**, which per yt-dlp's enforcement table is exactly the
configuration that produces a 403 on `web`. Piped-Backend also has no SABR implementation,
and its CI stream check was removed in February 2026 with the message "remove stream check
as being flagged as bot".

So Piped is a cautionary example rather than a model. The one idea worth taking from it is
the **process boundary**: putting BotGuard behind an HTTP call solves the `globalThis`
pollution problem more decisively than a worker thread does. We are not taking it, because
ViewTube ships as a single Docker image and a second mandatory service would break that;
`worker_threads` buys the same isolation within the constraint.

### Summary

| Project             | Attestation runs in         | Binding               | Per-video mint          | GVS token |
| ------------------- | --------------------------- | --------------------- | ----------------------- | --------- |
| invidious-companion | Worker + jsdom              | visitorData + videoId | yes, from a kept minter | yes       |
| NewPipe / PipePipe  | Android WebView             | videoId               | yes                     | yes       |
| yt-dlp              | plugin (BgUtils or browser) | videoId               | yes                     | yes       |
| **Piped**           | separate HTTP service       | visitorData only      | **no**                  | **no**    |

The consensus among the ones that currently work is uniform: **run BotGuard once in
something browser-shaped, keep the minter, mint per video.** Nobody re-attests per video;
Piped is the project that has to, and it shows. ViewTube is a server-side scraper like
Invidious, so `bgutils-js@4` + `jsdom` in a worker is the matching shape.

## Current state in this repo

`server/src/common/innertube/innertube.ts` used to hardcode a po_token/visitor_data pair
as literals. That was worse than sending nothing — a stale token bound to a `visitorData`
from whenever it was captured, so every request presented an identity YouTube can see is
not ours and is long past its TTL. **Removed 2026-08-27**; the env overrides remain.

Two things already in place work in our favour:

- `Platform.shim.eval` is wired to `node:vm` (added while fixing URL deciphering), so
  youtubei.js can already run YouTube's player JS.
- `getInfo(id, options)` in youtubei.js 18 accepts a **per-call** `po_token` that overrides
  the session one (`Innertube.js:53-62`). We do not need Invidious's manual
  `NavigationEndpoint` construction, and we do not need to rebuild the session per video.
- `VTSabrDto` already carries a `poToken` field; it is currently populated with
  `client.session.po_token`, i.e. the stale literal.

One useful confirmation from youtubei.js's source (`core/Player.js:140`):

```js
if (url_components.searchParams.get('sabr') !== '1' && this.po_token)
  url_components.searchParams.set('pot', this.po_token);
```

For SABR URLs it deliberately does **not** append `pot=`. That is correct: on the SABR
path the token belongs in the protobuf request body (`streamerContext.poToken`), which is
what `googlevideo`'s `onMintPoToken` callback supplies. So the client must be wired up too
— the server alone cannot fix the 403.

## ViewTube-specific constraint: this MUST run in a worker thread

BotGuard's interpreter requires DOM globals assigned onto `globalThis`:

```ts
Object.assign(globalThis, { window: dom.window, document: dom.window.document, ... });
```

In production, `server/src/main.ts` boots Nest **and imports the compiled Nuxt server
bundle into the same process**. Assigning `globalThis.window` and `globalThis.document`
would make every `typeof window !== 'undefined'` check in Vue, Pinia, ofetch and the rest
of the SSR stack return true during server rendering. That does not degrade SSR, it breaks
it.

So: `node:worker_threads`, non-negotiable. Invidious uses a Worker for the same reason.
This also gets us isolation of YouTube's obfuscated code and a clean kill/restart story on
token rotation.

## Egress identity: one session, one IP

A PO token is minted for a session, and YouTube can see which address that session is
used from. If a token is attested behind VPN exit A and the segment requests leave from
IP B, that mismatch is a stronger bot signal than having no VPN at all.

The consequence for our layout: the **player request is part of the session**. `getInfo`
carries the content token and receives the SABR URL and ustreamerConfig. Routing only the
media proxy and the minter through a tunnel, while `getInfo` keeps going out the main
container's address, splits one session across two identities. All YouTube-facing traffic
for a given playback — attestation, player request, and segments — must share an egress.

### Multi-IP without a second application

`common/proxyAgent.ts` already takes the proxy URL as a parameter (`getDispatcher(proxyUrl)`);
only `getProxyUrl()` pins it to a single `VIEWTUBE_PROXY_URL`. That makes the following
mostly a refactor rather than new infrastructure:

- Run N sidecars that each expose a SOCKS proxy on a different VPN exit (gluetun or
  equivalent). No bespoke service to write or maintain.
- Hold N **egress profiles** in-process. A profile is one SOCKS URL plus the Innertube
  session, `visitorData`, integrity token and minter created through it.
- The BotGuard worker fetches through its own profile's dispatcher — which phase 1 already
  requires — so IP coherence is a property of the design rather than something to enforce.

The minter does not need to _live_ behind the VPN. Its egress does, and that already works.

### Session affinity is the hard part

Segments cannot be round-robined across profiles. YouTube issues the SABR URL and
ustreamerConfig to one session, the token is bound to that session, and the bytes must be
fetched back out the same exit. The profile has to be pinned per playback, not per request.

Follow the existing pattern: `rewriteSabrHost` already stashes `__host` in the proxied URL,
so add `__egress=<profileId>` next to it, chosen once at `getInfo` time and honoured by
`core/videoplayback`. **Validate that parameter against the known profile list** — read
straight through, it is an arbitrary-proxy selector exposed to the internet.

### Caveats

- Commercial VPN exits are heavily abused and are frequently _worse_ for YouTube than an
  ordinary residential connection — bot interstitials and blanket 429s. Datacenter ranges
  are often pre-flagged. Exit quality is something to measure per provider, not a property
  gained by adding a VPN.
- Our own bisect is evidence that egress IP is **not** what causes the current 403: a
  browser-minted session returned 200 and a server-minted one returned 403 from the same
  machine and the same address. Multi-IP egress is worth building for rate-limit headroom
  and blast radius, not as a fix for this bug.

### A separate container is the right answer when

- one token pool has to be shared across several ViewTube instances;
- BotGuard needs hard crash isolation beyond what a worker thread gives;
- minting has to scale independently of the app (it is CPU-bursty).

For a single self-hosted instance, in-process profiles plus SOCKS sidecars reach the same
place with far less to operate, and keep the single-image default intact: with no profiles
configured, behaviour is identical to today.

### What this changes in the phases below

Nothing gets built for this before phase 0 clears. But the interface should assume it from
the start: thread the egress profile through the session, the minter and the playback proxy
as a **parameter**, never as a module-level global read from env. Made now it is a naming
decision; retrofitted later it touches every layer.

## Phase 0 — falsify the hypothesis before building anything

**Do this first and do not skip it.** The entire plan rests on one unproven assumption:
that a validly minted PO token turns our 403 into a 200. One standalone script in
`scripts/sabr-probe/` answers that in an afternoon, and if the answer is no, phases 1–6
are wasted work.

`scripts/sabr-probe/potoken-spike.mjs`:

1. jsdom + `getChallenge` + `BotGuardClient` → integrity token → `WebPoMinter`.
2. Mint session token bound to `visitorData`; build `Innertube` with that pair.
3. Mint content token bound to the video ID; `getInfo(id, { po_token: contentToken })`.
4. Assert `server_abr_streaming_url` and `video_playback_ustreamer_config` are present.
5. POST a real `VideoPlaybackAbrRequest` with `streamerContext.poToken` set to the content
   token, reusing the request builder the existing probes already have.
6. Print the HTTP status.

Run four variants so the result is interpretable rather than just binary:

| Variant                                    | Purpose                                             |
| ------------------------------------------ | --------------------------------------------------- |
| no token at all                            | baseline — should reproduce today's 403             |
| session token only (in `Innertube.create`) | is the player request the gate, or the GVS request? |
| content token only (in the SABR body)      | is the SABR body the gate?                          |
| both                                       | the intended configuration                          |

Also record whether `videoPlaybackUstreamerConfig` changes size when the player request
carries a token (ours was 1240 bytes vs the browser's 1213 — if a token closes that gap,
that is strong corroboration).

**Exit criterion:** at least one variant returns 200 and yields decodable media bytes. If
none do, stop and reassess — the remaining suspects would be the `WEB` client choice
itself (the guide notes `tv_simply` and `mweb` as alternatives) or cookie-backed session
state, not more token plumbing.

## Phase 1 — the token worker

**New:** `server/src/common/potoken/potoken.worker.ts`

Message protocol, mirroring Invidious's but typed with the existing Nest conventions:

- in: `{ type: 'init' }` → out: `{ type: 'ready', sessionPoToken, visitorData, ttlSecs, mintRefreshThreshold }`
- in: `{ type: 'mint', requestId, contentBinding }` → out: `{ type: 'minted', requestId, token }`
- out: `{ type: 'error', requestId?, message }`

Inside, following `bgutils-js@4.0.3` (API verified against the published typings):

```ts
import { BotGuardClient, getChallenge } from 'bgutils-js/botguard';
import { WebPoMinter } from 'bgutils-js/webpo';
import { buildURL, getHeaders, USER_AGENT } from 'bgutils-js/utils';

const challenge = await getChallenge({ fetchFunction: fetch, requestKey: 'O43z0dpjhgX20SCx4KAo' });
new Function(challenge.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue)();

const botGuardClient = await BotGuardClient.create({
  program: challenge.program,
  globalName: challenge.globalName,
  globalObject: globalThis // note: `globalObject`, not `globalObj` (that is the old 3.x name)
});

const webPoSignalOutput = [];
const botguardResponse = await botGuardClient.snapshot({ webPoSignalOutput });

const res = await fetch(buildURL('GenerateIT', true), {
  method: 'POST',
  headers: getHeaders(),
  body: JSON.stringify(['O43z0dpjhgX20SCx4KAo', botguardResponse])
});
const [integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken] =
  await res.json();

const minter = await WebPoMinter.create(
  { integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken },
  webPoSignalOutput
);
```

Notes:

- `visitorData` comes from a throwaway `Innertube.create({ retrieve_player: false })`
  inside the worker — the session token must be bound to the _same_ visitor data the real
  client will use, so the worker owns generating it and hands it out.
- Outbound fetch must go through `common/vtFetch.ts` / `proxyAgent.ts`, or attestation
  bypasses the configured SOCKS/HTTP proxy while playback does not — a subtle way to get a
  token bound to the wrong egress IP.
- `HTMLCanvasElement.prototype.getContext` will log a jsdom "Not implemented" error. It is
  expected and harmless; log a one-line note next to it so nobody files it as a bug.

## Phase 2 — `PoTokenService`

**New:** `server/src/common/potoken/potoken.service.ts` (+ module, exported globally like
the innertube helper).

Responsibilities:

- Own the worker's lifecycle; spawn at boot **in the background**, never blocking startup.
  Retry with backoff (1 s → 60 s, ×5) as Invidious does.
- Expose:
  - `getSession(): Promise<{ poToken, visitorData } | null>`
  - `mintContentToken(videoId: string): Promise<string | null>`
- **Single-flight the attestation** — concurrent callers during startup or rotation must
  await one in-flight generation, not trigger N BotGuard runs.
- **Never throw into request paths.** A failed mint returns `null` and playback fails with
  the error overlay that already exists; metadata, search and channels keep working.
- Bounded wait: `mintContentToken` should wait at most ~5 s for a not-yet-ready minter,
  then return `null`.

Rotation:

- Re-attest at `estimatedTtlSecs * 0.8`, and immediately on a mint failure.
- Build the replacement worker **before** killing the old one, and only swap after
  validation (below) — otherwise rotation is a guaranteed playback outage.
- Bump a monotonic `generation` counter on every swap; it is part of the cache key so
  tokens from a dead minter can never be served.

Validation before swap, adapted from Invidious but cheaper — we do not need their search:
mint a content token for a known-stable video ID, run `getInfo` with it, and issue one
SABR request; require a non-403. Reject the new session if it fails and keep the old one.

Config, in `env.validation.ts`:

| Var                        | Default | Meaning                                                                               |
| -------------------------- | ------- | ------------------------------------------------------------------------------------- |
| `VIEWTUBE_POTOKEN_ENABLED` | `true`  | master switch                                                                         |
| `VIEWTUBE_PO_TOKEN`        | unset   | manual override — when set **with** `VIEWTUBE_VISITOR_DATA`, skip generation entirely |
| `VIEWTUBE_VISITOR_DATA`    | unset   | as above                                                                              |

The manual-override path stays because it is how the `youtube-trusted-session-generator`
workflow and the e2e stack can pin a known-good pair.

## Phase 3 — wire the session token into the Innertube client

`server/src/common/innertube/innertube.ts`:

- **Delete the hardcoded `po_token` and `visitor_data` literals.**
- Take the pair from `PoTokenService.getSession()` when building the client.
- The current unconditional 10-minute recreation must not silently re-pair a fresh
  `visitor_data` with a stale token. Simplest correct rule: recreate on the existing timer,
  but always rebuild from the _current_ session pair, and force a recreate when the token
  generation counter changes.

Verification for this phase is deliberately not about playback: confirm homepage, search,
channels and comments still work. A bad token here degrades everything, not just video.

## Phase 4 — content token in the player request and the SABR block

`server/src/core/videos/videos.service.ts`:

```ts
const contentPoToken = await this.poTokenService.mintContentToken(id);
videoInfo = await client.getInfo(id, contentPoToken ? { po_token: contentPoToken } : undefined);
```

`server/src/core/videos/sabr.builder.ts` — take the content token as a parameter and put it
in the DTO instead of `client.session.po_token`:

```ts
export const buildSabrBlock = async (videoInfo, client, contentPoToken?: string) => {
  // …
  return { /* … */ poToken: contentPoToken /* … */ };
};
```

Caching: content tokens are cheap to mint but `getInfo` results are already cached, so key
any token cache as `potoken:content:<generation>:<videoId>` with a TTL well under the
integrity token's. Including `<generation>` is what makes rotation safe.

**API regeneration:** `poToken` already exists on `VTSabrDto`, so the schema is unchanged —
but re-run `pnpm --filter=./server run gen:api` anyway and confirm the diff is empty.
Remember to stop `pnpm serve:server` first (see CLAUDE.md on `metadata.ts`).

## Phase 5 — client: feed the token to the SABR adapter

`client/app/utils/videoplayer/adapters/sabrAdapter.ts` currently carries:

```ts
// No onMintPoToken: the SABR endpoint does not validate the token on this path
```

That comment was written on the strength of an isolation test that compared _no token_
against _the stale hardcoded token_ — two ways of sending an invalid token, which is why
they looked equivalent. It is wrong and must go.

```ts
if (source.poToken) {
  sabrAdapter.onMintPoToken(async () => source.poToken);
}
```

`googlevideo` does `base64ToU8(await cb())`, so hand it the websafe base64 string exactly
as the server produced it.

Expiry mid-playback: `videoState.ts` already notes that "SABR is the only source that
re-issues itself for the same video (po_token expiry)". Once phase 4 lands, that path
should re-request the video info to obtain a fresh content token rather than reusing the
one captured at load time. Keep this as the last step of the phase — it only matters for
sessions longer than the integrity token TTL.

## Phase 6 — hardening

- Metrics/log lines for: attestation success/failure, time to first token, rotation events,
  mint failures. Invidious's experience is that this fails silently and periodically; the
  log is how anyone diagnoses it.
- Docker: confirm `jsdom` and the worker file land in the runtime image. The server builds
  with the **SWC** builder, which emits per-file JS, so `potoken.worker.ts` becomes
  `dist/common/potoken/potoken.worker.js`; resolve it via `__dirname` and add a boot-time
  existence check rather than discovering it in production.
- Update `README.md`/`TODO.md` on the new env vars and the fact that a ViewTube instance
  now runs BotGuard.

## Risks and open questions

| Risk                                                                                                                  | Mitigation                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The token is not the cause of the 403.** Everything here is contingent on that.                                     | Phase 0 spike. Cheap, decisive, first.                                                                                                            |
| jsdom is not browser-shaped enough and BotGuard starts rejecting it                                                   | Nothing to do preemptively; this is the standing risk every project in this space carries. Keep the manual-override env vars as the escape hatch. |
| `bgutils-js` is ESM-only and the server compiles to CJS                                                               | Low: `youtubei.js` is already ESM-only and works today via Node 26's `require(esm)`. Verify in phase 0 regardless.                                |
| jsdom pulls a large dependency tree into the server image                                                             | Accept; it is what Invidious ships. Measure the image delta and note it.                                                                          |
| Attestation egress IP differs from playback egress IP                                                                 | Route the worker's fetch through `common/vtFetch.ts` / `proxyAgent.ts`.                                                                           |
| Token rotation causes a playback outage                                                                               | Build-then-validate-then-swap; never kill the live minter first.                                                                                  |
| BotGuard CPU cost on a small instance                                                                                 | Once per TTL, in a worker. Negligible if the single-flight guard actually works — test it.                                                        |
| `estimatedTtlSecs` is unreliable (the guide contradicts itself: "as short as 12 hours" vs "valid for several months") | Do not trust it alone; treat mint/playback failure as the real rotation trigger.                                                                  |

## Verification checklist

- [ ] Phase 0 spike returns 200 for at least one variant, with decodable media bytes
- [ ] Which variant works is recorded — it determines whether phase 4, phase 5, or both are load-bearing
- [ ] Hardcoded `po_token` / `visitor_data` literals deleted
- [ ] Homepage, search, channel and comment endpoints unaffected
- [ ] `pnpm --filter=./server run gen:api` produces an empty diff
- [ ] Server and client typecheck; `pnpm lint` clean
- [ ] A video plays end to end in the browser, with the error overlay gone
- [ ] Server restart with `VIEWTUBE_POTOKEN_ENABLED=false` still serves metadata and shows the overlay rather than hanging
- [ ] Forced rotation mid-session does not interrupt an in-flight playback
- [ ] `pnpm e2e` watch spec compared against a pre-change baseline

## References

- [yt-dlp PO Token Guide](https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide)
- [LuanRT/BgUtils](https://github.com/LuanRT/BgUtils) — `examples/index.ts` is the reference for the 4.x API
- [iv-org/invidious-companion](https://github.com/iv-org/invidious-companion) — `src/lib/jobs/potoken.ts`, `src/lib/jobs/worker.ts`, `src/lib/helpers/youtubePlayerReq.ts`
- [PipePipe SABR docs](https://priveetee.github.io/Docs-PipePipe/extractor/sabr.html)
- [TeamPiped/Piped-Backend](https://github.com/TeamPiped/Piped-Backend) — `src/main/java/me/kavin/piped/utils/BgPoTokenProvider.java`
- [TeamPiped/bg-helper-server](https://github.com/TeamPiped/bg-helper-server) — `src/index.ts`, the whole service
- [NewPipe #12248 — coordinating SABR efforts](https://github.com/TeamNewPipe/NewPipe/issues/12248)
