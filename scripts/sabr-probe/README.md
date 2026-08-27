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
