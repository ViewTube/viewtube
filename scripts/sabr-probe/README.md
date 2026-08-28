# SABR probes

Diagnostics for why VOD playback is broken. Three scripts, in the order you should run
them. Requires a Chromium/Chrome binary for the last two (`--chrome <path>`, defaults to
`/usr/bin/chromium`).

```bash
cd scripts/sabr-probe
npm install
npm run probe      # our request, every po_token strategy
npm run browser    # what a real browser gets on this network
npm run capture    # decode the browser's request, then replay it from node
npm run token      # is the po_token actually checked?
npm run spike      # phase 0: does a minted po_token change anything? (it does not)
npm run playback   # end-to-end: does a video play in ViewTube itself?
npm run controls   # seek, quality, audio and captions against a live SABR stream
npm run reload     # does a mid-playback session swap keep playing?
npm run trace      # every SABR request paired with the UMP parts YouTube answered with
npm run wall       # like trace, but decodes the server's directives instead of naming them
npm run download   # googlevideo's own downloader: how far into a video does YouTube serve?
npm run login      # is "sign in to confirm you're not a bot" a po_token problem? (it is not)
npm run clients    # which innertube client still gets a playable player response?
npm run timeline   # what po_token does a real browser send, and when does it change?
npm run resume     # does a fresh session/token let a cut-off video continue? (it does not)
npm run realchrome # attach to a plainly-launched Chromium; does it pass BotGuard?
```

`trace` is the one to reach for when playback misbehaves rather than fails outright: it is
the only probe that sees a response _body_, because it teases the stream apart inside the
page (puppeteer cannot read these — they are streamed and the adapter aborts them once it
has its segment). A ~90-byte response carrying only policies is the server declining to
serve media; the header comment in `ump-trace.mjs` explains how to read the pairs.

```bash
npm run trace -- --video <id> --seconds 40      # sequential playback
npm run trace -- --video <id> --seek 100        # play 15s, then seek
npm run wall  -- --video <id> --seconds 55      # decoded policies per request
npm run wall  -- --video <id> --start 100       # begin the session at 100s, not at 0
```

`controls`, `reload` and `trace` need both dev servers up. `reload` drives the dev-only
`window.__vtSabrReload` seam in `sabrAdapter.ts` — YouTube only asks for a real reload
after hours of playback, so that seam is the sole way to exercise the path. It intercepts
the refetch and tags the new streaming URL, then asserts later segment requests carry the
tag; `ei`/`expire` come back identical on a refetch and cannot be used to tell an applied
swap from an ignored one.

`download` is the control to reach for before blaming ViewTube for anything that goes wrong
mid-playback. It drives googlevideo's own node downloader — no Shaka, no request
interceptor, none of our code — and reports how many seconds of each track YouTube actually
served, plus every `STREAM_PROTECTION_STATUS` update. Status 1 means the video will play to
the end; status 2, which YouTube sets from the very first response, means it wants
attestation and will stop serving about a minute in whatever the client does. `--token
session|content` mints a BotGuard token and `--po-token <b64>` replays a literal one
(`capture` prints the browser's), which is how "a PO token does not lift it" in
`SABR_PLAN.md` was measured. Needs no dev server.

`timeline` is the **browser control**, and it is the first thing to run when a video
misbehaves mid-playback — before touching adapter code. It plays the video on youtube.com in
a real Chrome and reports how far into the _feature_ (not the pre-roll ad) it actually got.
If Chrome stops too, there is no ViewTube bug to find: on 2026-08-28 it reached 42.6s of a
153s video and then showed YouTube's own "Something went wrong", which is what overturned a
day-old "attestation gate" diagnosis. `--consent accept|reject` picks the cookie choice;
both were measured and they make no difference.

> Two traps this probe has already fallen into, both of which produce confident-looking
> nonsense rather than an error: YouTube's consent buttons live inside Polymer **shadow
> roots**, so a `document.querySelectorAll('button')` sweep silently dismisses nothing and
> every subsequent reading is of a blocked page; and a **pre-roll ad** runs on the same
> `<video>` element as the feature, so a single `currentTime` reading at the end can be
> measuring a 15-second ad. The probe now pierces shadow roots, clears ads, and reports the
> feature duration alongside the position so both failures are visible in the output.

`timeline` also settled the PO token question. A real Chrome sends a 10-byte cold-start
placeholder for the first ~16 seconds of playback and then switches to a real ~95-byte
BotGuard token; it prints both, plus the `visitorData` they are bound to, so the pair can be
replayed coherently through `download --po-token <t> --visitor-data <v>`. Doing that still
hits the same wall, which is how "the token is not what separates us from Chrome" was
established rather than assumed. See `POTOKEN_PLAN.md`.

`resume` answers the obvious follow-up to a video being cut off partway: _would getting a
new token mid-playback let it continue?_ It downloads until the stream dies, then builds a
completely independent session — new Innertube, new player request, new streaming URL and
ustreamer config, newly minted token — and tries again from there. On 2026-08-28 both
sessions stopped at exactly 63.6s having received byte-identical amounts, so the cut-off is
anchored to the position in the video, not to the age of the session. That is what rules
out wiring the wall into `sabrAdapter`'s existing `reloadSession` path as a fix.

`realchrome` is the open experiment. Unlike every other browser probe here it does **not**
launch Chromium through puppeteer — it attaches over CDP to one started as an ordinary
process, in an explicitly incognito context, because a human-driven incognito Chrome plays
videos that a puppeteer-launched one gets cut off on. Start the browser yourself first:

```bash
chromium --incognito --remote-debugging-port=9222 --user-data-dir=/tmp/vt-chrome-profile \
  --no-first-run --no-default-browser-check --mute-audio --autoplay-policy=no-user-gesture-required
npm run realchrome -- --video <id> --seconds 150
```

It prints how far into the feature it got plus the PO token and `visitorData` the page
minted, so a pass can be confirmed with `download --po-token <t> --visitor-data <v>`. As of
2026-08-28 it has no result yet — the run was cut short by the address being rate-limited.

> **These probes burn IP reputation.** Several consecutive runs are enough to get an address
> answering `LOGIN_REQUIRED` for most videos, at which point nothing downstream can be
> measured and every result looks like a playback bug. `clients` is the quickest way to tell
> a blocked address from a real finding — check it before trusting a bad run.

`login` and `clients` are for the other kind of refusal: `getInfo` answering
`LOGIN_REQUIRED` or `UNPLAYABLE` with no streaming data at all, which is upstream of
everything the SABR probes measure. Between them they separate "the token is wrong" from
"the client is wrong" from "the address is blocked". On 2026-08-27 it was the address —
every token strategy and every working client failed identically, and moving to a different
VPN exit fixed it.

`spike` is the decisive one for the _first_ request and needs no dev server. It runs a
single BotGuard attestation, keeps the minter, and tests the player-request token and the
SABR-body token as independent axes; as of 2026-08-27 all five cases return 200, including
the case with no token at all. **It is not evidence about mid-playback**: it sends one
request per case and stops, well before the attestation gate closes, and reading it as
"PO tokens are not a gate" is what left the attestation wall undiagnosed for a day. Use
`download` for that question. See `POTOKEN_PLAN.md`.

`playback` needs both dev servers up (`pnpm serve:server`, `pnpm serve:client`) and reports
the `<video>` element's state, every `/api/videoplayback` call, and any Shaka error with its
numeric code.

This directory is deliberately outside the pnpm workspace (`pnpm-workspace.yaml` lists
packages explicitly), so `npm install` here never touches the repo lockfile and
`puppeteer-core` / `bgutils-js` / `jsdom` never become ViewTube dependencies.

## What these established (2026-08-27)

Run in order, they narrowed the problem to one thing:

| Probe                                                                     | Result                     |
| ------------------------------------------------------------------------- | -------------------------- |
| `probe` — our request, no / cold-start / freshly-minted BotGuard po_token | `403` on all three         |
| `browser` — Chromium on the same machine and network                      | **`200`**, video plays     |
| `capture` — replay the browser's captured body from plain node            | **`200`, 771 KB of media** |

So: the network is fine, no browser environment is required, and a valid BotGuard token
is _not_ the missing piece. **Our request body is simply built wrong.** That last row is
the important one — it means a correctly-shaped request works from the server, with no
Chrome in the loop.

### How the browser's request differs from ours

From `npm run capture`:

| Field                                                 | Browser                                                                             | Ours                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------- |
| `selectedFormatIds`                                   | **empty**                                                                           | one format            |
| `preferredAudioFormatIds` / `preferredVideoFormatIds` | 2 / 16                                                                              | empty                 |
| `streamerContext.poToken`                             | **10 bytes**                                                                        | ~110 bytes (BotGuard) |
| `streamerContext.playbackCookie`                      | present                                                                             | absent                |
| `clientAbrState`                                      | ~45 fields, incl. `playbackAuthorization`, `mediaCapabilities`, `bandwidthEstimate` | 2 fields              |
| `enabledTrackTypesBitfield`                           | `0`                                                                                 | `1`                   |

The 10-byte po_token is the standout: the web player sends a short session-bound token,
not the large BotGuard-minted one. Replaying that exact token from node does **not** clear
the attestation gate either (`npm run download -- --po-token`), so the interesting
difference is more likely `clientAbrState.playbackAuthorization` — which the browser sends
and googlevideo does not — than the token.

### The po_token is not checked on the first request (`npm run token`)

Take a known-good captured request and change only the token. Every variant still returns
~800 KB of media. (This heading used to read "not checked at all"; that overreached — see
the note under the table.)

| Variant                                   | Result              |
| ----------------------------------------- | ------------------- |
| raw captured bytes (control)              | 200, `MEDIA×29`     |
| re-encoded, token unchanged (control)     | 200, `MEDIA×31`     |
| **token removed entirely**                | **200, `MEDIA×31`** |
| **token replaced with 10 garbage bytes**  | **200, `MEDIA×31`** |
| **token replaced with 110 garbage bytes** | **200, `MEDIA×31`** |

Both controls pass, so the decode/re-encode round-trip is faithful and the comparison is
valid, and the token is not what gates the _first_ request.

**Do not read this as "a po_token minter is not needed", which is what an earlier version
of this file said.** Every row above is one request; YouTube's attestation gate does not
close until about a minute of media has been served. On videos it flags, playback stops
there whatever token is sent — a minter would not help either, but for a different reason
than "the token is never checked". `STREAM_PROTECTION_STATUS` is the field that says which
world you are in: 1 = will play to the end, 2 = attestation wanted and enforced later.
`npm run download` is the probe that reads it.

### Every SABR response starts with a redirect

The first response is a `SABR_REDIRECT` pointing at the host that actually serves media —
about 1 KB, no media in it. **This must be followed**, or it looks like success while
delivering nothing. An early version of this probe reported "200" for all cases purely
because it stopped at the redirect. `SabrStreamingAdapter` handles this; anything
hand-rolled must too, and `/api/videoplayback` has to allow the redirected host (its
`__host` check already permits any `*.googlevideo.com`).

Note that `googlevideo`'s node-oriented `SabrStream` also got `403` when configured
minimally. The browser path uses `SabrStreamingAdapter` driven by a real player (Shaka),
which populates `clientAbrState` and the preferred-format lists properly — so the client
adapter in SABR_PLAN phase 3 is the right shape, and the earlier "don't build it"
conclusion was wrong. `SabrStream` works fine when its formats are mapped to camelCase
first (`sabr-download.mjs` does this), which is what makes it usable as an independent
control.

## Reading `npm run probe`

- **`200` anywhere** — that po_token strategy works; implement it.
- **`403` everywhere** — matches the baseline above. Not a token problem; compare your
  request against `npm run capture` output rather than chasing tokens.

With `--proxy http://localhost:8067/api` each row runs twice, direct and through
ViewTube's `/api/videoplayback`. The two should match; if only the proxy fails, the bug is
in `videoplayback.service.ts`.

## Options

```bash
npm run probe    -- --video <id> --proxy http://localhost:8067/api
npm run browser  -- --video <id> --headless --seconds 30 --chrome /usr/bin/chromium
npm run capture  -- --video <id>
npm run download -- --video <id> --stop-after 90000
npm run download -- --video <id> --token session      # or: --token content
npm run download -- --video <id> --po-token <base64>  # a token `capture` printed
npm run clients  -- --videos <id>,<id> --clients WEB,MWEB,ANDROID
```

`browser` and `capture` run headful by default — headless is detectable and YouTube may
behave differently. They open a real browser window, dismiss the consent wall, and close
themselves.
