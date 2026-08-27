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
```

`spike` is the decisive one and needs no dev server. It runs a single BotGuard attestation,
keeps the minter, and tests the player-request token and the SABR-body token as independent
axes. As of 2026-08-27 all five cases return 200 — **including the case with no token at
all** — which is what established that PO tokens are not currently a gate. See
`POTOKEN_PLAN.md`. Re-run it before implementing any PO token work: if the no-token case
stops returning 200, enforcement has reached us and the plan is live again.

`playback` needs both dev servers up (`pnpm serve:server`, `pnpm serve:client`) and reports
the `<video>` element's state, every `/api/videoplayback` call, and any Shaka error with its
numeric code.

This directory is deliberately outside the pnpm workspace (`pnpm-workspace.yaml` lists
packages explicitly), so `npm install` here never touches the repo lockfile and
`puppeteer-core` / `bgutils-js` / `jsdom` never become ViewTube dependencies.

## What these established (2026-08-27)

Run in order, they narrowed the problem to one thing:

| Probe | Result |
| --- | --- |
| `probe` — our request, no / cold-start / freshly-minted BotGuard po_token | `403` on all three |
| `browser` — Chromium on the same machine and network | **`200`**, video plays |
| `capture` — replay the browser's captured body from plain node | **`200`, 771 KB of media** |

So: the network is fine, no browser environment is required, and a valid BotGuard token
is *not* the missing piece. **Our request body is simply built wrong.** That last row is
the important one — it means a correctly-shaped request works from the server, with no
Chrome in the loop.

### How the browser's request differs from ours

From `npm run capture`:

| Field | Browser | Ours |
| --- | --- | --- |
| `selectedFormatIds` | **empty** | one format |
| `preferredAudioFormatIds` / `preferredVideoFormatIds` | 2 / 16 | empty |
| `streamerContext.poToken` | **10 bytes** | ~110 bytes (BotGuard) |
| `streamerContext.playbackCookie` | present | absent |
| `clientAbrState` | ~45 fields, incl. `playbackAuthorization`, `mediaCapabilities`, `bandwidthEstimate` | 2 fields |
| `enabledTrackTypesBitfield` | `0` | `1` |

The 10-byte po_token is the standout: the web player sends a short session-bound token,
not the large BotGuard-minted one.

### The po_token is not checked at all (`npm run token`)

Take a known-good captured request and change only the token. Every variant still returns
~800 KB of media:

| Variant | Result |
| --- | --- |
| raw captured bytes (control) | 200, `MEDIA×29` |
| re-encoded, token unchanged (control) | 200, `MEDIA×31` |
| **token removed entirely** | **200, `MEDIA×31`** |
| **token replaced with 10 garbage bytes** | **200, `MEDIA×31`** |
| **token replaced with 110 garbage bytes** | **200, `MEDIA×31`** |

Both controls pass, so the decode/re-encode round-trip is faithful and the comparison is
valid. **A po_token minter is not needed.** Chasing token minting was the wrong lead
entirely.

Watch `STREAM_PROTECTION_STATUS` in the response if this ever changes — that is the part
that signals attestation being required.

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
conclusion was wrong.

## Reading `npm run probe`

- **`200` anywhere** — that po_token strategy works; implement it.
- **`403` everywhere** — matches the baseline above. Not a token problem; compare your
  request against `npm run capture` output rather than chasing tokens.

With `--proxy http://localhost:8067/api` each row runs twice, direct and through
ViewTube's `/api/videoplayback`. The two should match; if only the proxy fails, the bug is
in `videoplayback.service.ts`.

## Options

```bash
npm run probe   -- --video <id> --proxy http://localhost:8067/api
npm run browser -- --video <id> --headless --seconds 30 --chrome /usr/bin/chromium
npm run capture -- --video <id>
```

`browser` and `capture` run headful by default — headless is detectable and YouTube may
behave differently. They open a real browser window, dismiss the consent wall, and close
themselves.
