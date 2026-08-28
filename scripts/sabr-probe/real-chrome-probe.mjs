/**
 * Attaches to a plainly-launched Chromium instead of launching one through puppeteer.
 *
 * `puppeteer.launch` starts the browser with `--enable-automation` and friends, and a
 * human-driven incognito Chrome plays videos that the puppeteer-driven one gets cut off
 * on — so the automation flags, not the video or the network, are the likely difference.
 * This connects over CDP to a browser started as an ordinary process, which is as close to
 * the passing case as this can get without a person at the keyboard.
 *
 * Reports how far into the feature it gets, and captures the PO token the page mints so it
 * can be replayed through `sabr-download --po-token`.
 */
import { VideoPlaybackAbrRequest } from 'googlevideo/protos';
import puppeteer from 'puppeteer-core';

const arg = (n, d) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : d);
const videoId = arg('--video', 'is8UDe2PhKQ');
const seconds = Number(arg('--seconds', '150'));
const endpoint = arg('--browser-url', 'http://127.0.0.1:9222');

const browser = await puppeteer.connect({ browserURL: endpoint, defaultViewport: null });
const rows = [];
const started = Date.now();

let context;

try {
  // An explicitly incognito context, not merely a throwaway profile directory: the case
  // that plays these videos in full was an incognito window, and a fresh profile still
  // accumulates a session as it browses.
  context = await browser.createBrowserContext();
  const page = await context.newPage();

  // Installed before any page script so the player cannot capture the original fetch first
  // — the reason a console-pasted hook captures nothing.
  await page.evaluateOnNewDocument(() => {
    window.__vtBodies = [];
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input?.url;
      if (url?.includes('videoplayback') && init?.body) {
        try {
          const bytes =
            init.body instanceof Uint8Array
              ? init.body
              : new Uint8Array(await new Response(init.body).arrayBuffer());
          window.__vtBodies.push(Array.from(bytes));
        } catch {
          // Body not readable twice; the next request will do.
        }
      }
      return originalFetch(input, init);
    };
  });

  const dismissConsent = async () => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const clicked = await page
        .evaluate(() => {
          const findButton = root => {
            for (const el of root.querySelectorAll('*')) {
              const label = el.getAttribute?.('aria-label');
              if (el.tagName === 'BUTTON' && label?.startsWith('Accept the use of cookies'))
                return el;
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
        })
        .catch(() => false);
      if (clicked) {
        await new Promise(r => setTimeout(r, 3000));
        return true;
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    return false;
  };

  await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  console.log(`consent: ${(await dismissConsent()) ? 'dismissed' : 'no dialog'}`);

  await page.evaluate(() => document.querySelector('video')?.play()).catch(() => {});

  // Skip or wait out the pre-roll: ads run on the same element as the feature.
  for (let attempt = 0; attempt < 60; attempt++) {
    const adShowing = await page
      .evaluate(() => {
        const player = document.querySelector('#movie_player');
        const skip = document.querySelector(
          '.ytp-skip-ad-button, .ytp-ad-skip-button, .ytp-ad-skip-button-modern'
        );
        if (skip) skip.click();
        return !!player?.classList.contains('ad-showing');
      })
      .catch(() => false);
    if (!adShowing) break;
    await new Promise(r => setTimeout(r, 1000));
  }

  const deadline = Date.now() + seconds * 1000;
  while (Date.now() < deadline) {
    const sample = await page
      .evaluate(() => {
        const v = document.querySelector('video');
        if (!v) return null;
        return {
          t: +v.currentTime.toFixed(1),
          d: +(v.duration ?? 0).toFixed(1),
          ad: !!document.querySelector('.ad-showing, .ytp-ad-player-overlay')
        };
      })
      .catch(() => null);
    if (sample) rows.push({ at: Date.now() - started, ...sample });
    await new Promise(r => setTimeout(r, 2000));
  }

  const bodies = await page.evaluate(() => window.__vtBodies ?? []);
  const featureDuration = Math.max(...rows.map(r => r.d), 0);
  const onFeature = rows.filter(r => r.d === featureDuration && !r.ad);
  console.log(
    `\nfeature duration ${featureDuration}s — reached ${Math.max(...onFeature.map(r => r.t), 0)}s`
  );

  const tokens = new Map();
  for (const body of bodies) {
    try {
      const decoded = VideoPlaybackAbrRequest.decode(new Uint8Array(body));
      const token = decoded.streamerContext?.poToken;
      if (token?.length) {
        tokens.set(
          token.length,
          Buffer.from(token).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
        );
      }
    } catch {
      // Not every captured body decodes; the useful ones do.
    }
  }
  console.log(`captured ${bodies.length} request bodies, token sizes: ${[...tokens.keys()]}`);
  const longest = [...tokens.entries()].sort((a, b) => b[0] - a[0])[0];
  if (longest) console.log(`\nPO_TOKEN(${longest[0]}B): ${longest[1]}`);

  const visitorData = await page
    .evaluate(() => window.ytcfg?.get?.('INNERTUBE_CONTEXT')?.client?.visitorData ?? null)
    .catch(() => null);
  console.log(`VISITOR_DATA: ${visitorData}`);

  await page.close();
} finally {
  await context?.close().catch(() => {});
  browser.disconnect();
}
