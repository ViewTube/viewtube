/**
 * What PO token does a real browser send, and does it change as playback goes on?
 *
 * This is the experiment that decides whether the PO token plan is worth building. Our own
 * requests stall about a minute into videos YouTube flags with `STREAM_PROTECTION_STATUS`
 * 2, while a real Chrome plays the same videos to the end — so Chrome has something we do
 * not. `capture-body` only looks at the first few requests, which carry a 10-byte
 * cold-start placeholder; replaying that does not help. The question is what the browser
 * sends *past* the point where we get cut off.
 *
 * Prints one row per SABR request: elapsed time, player time, token length, and the token
 * itself when it is short enough to be a placeholder. A jump from 10 bytes to a
 * ~110-byte BotGuard token around the wall is the result that makes minting the fix.
 */
import { VideoPlaybackAbrRequest } from 'googlevideo/protos';
import puppeteer from 'puppeteer-core';

const arg = (n, d) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : d);
const videoId = arg('--video', 'is8UDe2PhKQ');
const seconds = Number(arg('--seconds', '110'));
const consentChoice = arg('--consent', 'reject');

/**
 * Dismisses YouTube's consent dialog.
 *
 * The buttons live inside Polymer shadow roots under
 * `ytd-consent-bump-v2-lightbox > tp-yt-paper-dialog`, so a plain
 * `document.querySelectorAll('button')` never sees them — which is why an earlier version of
 * this probe silently failed to dismiss anything and every "browser playback" reading it
 * produced was of a blocked page.
 *
 * `choice` selects the button by its aria-label, so accept-vs-reject can be compared: it is
 * an open question whether a consented session is treated more leniently by playback.
 */
const dismissConsent = async (page, choice) => {
  const wanted = choice === 'accept' ? 'Accept the use of cookies' : 'Reject the use of cookies';

  for (let attempt = 0; attempt < 8; attempt++) {
    const clicked = await page
      .evaluate(prefix => {
        // Walks open shadow roots as well as the light DOM.
        const findButton = root => {
          for (const el of root.querySelectorAll('*')) {
            const label = el.getAttribute?.('aria-label');
            if (el.tagName === 'BUTTON' && label?.startsWith(prefix)) return el;
            if (el.shadowRoot) {
              const nested = findButton(el.shadowRoot);
              if (nested) return nested;
            }
          }
          return null;
        };

        const button = findButton(document);
        if (!button) return false;
        button.click();
        return true;
      }, wanted)
      .catch(() => false);

    if (clicked) {
      await new Promise(r => setTimeout(r, 3000));
      return true;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
};

/**
 * Ads run on the same `<video>` element as the feature, so a naive reading of `currentTime`
 * measures the ad. Skip when YouTube offers it, otherwise wait the ad out.
 */
const clearAds = async page => {
  for (let attempt = 0; attempt < 60; attempt++) {
    const state = await page
      .evaluate(() => {
        const player = document.querySelector('#movie_player');
        const showing = !!player?.classList.contains('ad-showing');
        const skip = document.querySelector(
          '.ytp-skip-ad-button, .ytp-ad-skip-button, .ytp-ad-skip-button-modern'
        );
        if (showing && skip) skip.click();
        return showing;
      })
      .catch(() => false);

    if (!state) return;
    await new Promise(r => setTimeout(r, 1000));
  }
};

const browser = await puppeteer.launch({
  executablePath: arg('--chrome', '/usr/bin/chromium'),
  headless: false,
  args: ['--autoplay-policy=no-user-gesture-required', '--no-first-run', '--mute-audio']
});

const rows = [];
const started = Date.now();

try {
  const page = await browser.newPage();
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');

  const pending = new Map();
  cdp.on('Network.requestWillBeSent', event => {
    if (event.request.method !== 'POST') return;
    if (!/\.googlevideo\.com/.test(event.request.url)) return;
    pending.set(event.requestId, event.request.url);
  });

  cdp.on('Network.responseReceived', async event => {
    if (!pending.has(event.requestId)) return;
    pending.delete(event.requestId);
    try {
      const { postData, base64Encoded } = await cdp.send('Network.getRequestPostData', {
        requestId: event.requestId
      });
      const bytes = base64Encoded
        ? Uint8Array.from(Buffer.from(postData, 'base64'))
        : new TextEncoder().encode(postData);
      const decoded = VideoPlaybackAbrRequest.decode(bytes);
      const token = decoded.streamerContext?.poToken;
      rows.push({
        atMs: Date.now() - started,
        playerTimeMs: Number(decoded.clientAbrState?.playerTimeMs ?? 0),
        tokenLength: token?.length ?? 0,
        token: token
          ? Buffer.from(token).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
          : null,
        status: event.response.status
      });
    } catch {
      // Body already evicted from the CDP buffer.
    }
  });

  await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  const dismissed = await dismissConsent(page, consentChoice);
  console.log(`consent (${consentChoice}): ${dismissed ? 'dismissed' : 'no dialog found'}`);

  if (!page.url().includes('/watch')) {
    await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await dismissConsent(page, consentChoice);
  }

  await page.evaluate(() => document.querySelector('video')?.play()).catch(() => {});
  await clearAds(page);
  await page.evaluate(() => document.querySelector('video')?.play()).catch(() => {});

  // Poll rather than sleep: an ad plays first on many videos, so the <video> element runs a
  // short unrelated stream before the real one. Tracking (duration, currentTime) over time
  // is what distinguishes "Chrome played the feature past the wall" from "Chrome played a
  // 15s ad", which a single reading at the end cannot.
  const samples = [];
  const deadline = Date.now() + seconds * 1000;
  while (Date.now() < deadline) {
    const sample = await page
      .evaluate(() => {
        const v = document.querySelector('video');
        if (!v) return null;
        const ad = document.querySelector('.ad-showing, .ytp-ad-player-overlay');
        return {
          t: +v.currentTime.toFixed(1),
          d: +(v.duration ?? 0).toFixed(1),
          ad: !!ad,
          paused: v.paused
        };
      })
      .catch(() => null);
    if (sample) samples.push({ at: Date.now() - started, ...sample });
    await new Promise(r => setTimeout(r, 2000));
  }

  // The feature is the longest duration seen; ads are short and report their own.
  const featureDuration = Math.max(...samples.map(s => s.d));
  const onFeature = samples.filter(s => s.d === featureDuration && !s.ad);
  console.log(
    `\nfeature duration ${featureDuration}s — Chrome reached ${Math.max(
      ...onFeature.map(s => s.t),
      0
    )}s on it`
  );
  const stalled = onFeature.filter((s, i) => i > 0 && s.t === onFeature[i - 1].t && !s.paused);
  console.log(`stalled samples on the feature: ${stalled.length} of ${onFeature.length}`);

  const final = await page.evaluate(() => {
    const v = document.querySelector('video');
    return {
      currentTime: v ? +v.currentTime.toFixed(1) : null,
      duration: v ? +(v.duration ?? 0) : null,
      // Printed so the token can be replayed in a *coherent* session: a PO token is bound
      // to the visitor, so handing it to an Innertube client with a different visitorData
      // tests nothing. `sabr-download --visitor-data` takes this.
      visitorData: window.ytcfg?.get?.('INNERTUBE_CONTEXT')?.client?.visitorData ?? null
    };
  });
  console.log(`\nbrowser reached ${final?.currentTime}s of ${final?.duration}s`);
  console.log(`visitorData: ${final?.visitorData ?? '(not found)'}\n`);
} finally {
  await browser.close();
}

console.log('  at(s)  playerTime(s)  status  tokenBytes  token');
for (const r of rows) {
  console.log(
    `  ${(r.atMs / 1000).toFixed(1).padStart(5)}  ${(r.playerTimeMs / 1000)
      .toFixed(1)
      .padStart(12)}  ${String(r.status).padStart(6)}  ${String(r.tokenLength).padStart(10)}  ${
      r.tokenLength && r.tokenLength <= 24 ? r.token : r.tokenLength ? '(long)' : '-'
    }`
  );
}

const lengths = [...new Set(rows.map(r => r.tokenLength))];
console.log(`\ndistinct token lengths seen: ${lengths.join(', ') || 'none'}`);
const longest = rows.filter(r => r.tokenLength === Math.max(...lengths))[0];
if (longest?.token) console.log(`longest token: ${longest.token}`);
