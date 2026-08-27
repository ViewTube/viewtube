/**
 * Diffs the VideoPlaybackAbrRequest ViewTube sends against the one youtube.com sends.
 *
 * Both are captured from a real browser: youtube.com's via CDP on the watch page,
 * ViewTube's from the POST it makes to /api/videoplayback. Whatever differs is what
 * YouTube is rejecting us for.
 */
import { VideoPlaybackAbrRequest } from 'googlevideo/protos';
import puppeteer from 'puppeteer-core';

const arg = name =>
  process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : undefined;
const videoId = arg('--video') ?? 'dQw4w9WgXcQ';
const viewtube = arg('--base') ?? 'http://localhost:8066';

const launch = () =>
  puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: false,
    args: ['--autoplay-policy=no-user-gesture-required', '--no-first-run', '--mute-audio']
  });

/** Pre-setting SOCS skips the consent wall entirely; clicking it is unreliable. */
const skipConsent = async page => {
  for (const domain of ['.youtube.com', '.google.com']) {
    await page.setCookie({ name: 'SOCS', value: 'CAI', domain, path: '/' }).catch(() => {});
  }
};

const captureBody = async (url, matcher, { consent = false } = {}) => {
  const browser = await launch();
  let captured = null;
  try {
    const page = await browser.newPage();
    if (consent) await skipConsent(page);

    const cdp = await page.createCDPSession();
    await cdp.send('Network.enable');

    const pending = new Map();
    cdp.on('Network.requestWillBeSent', e => {
      if (e.request.method === 'POST' && matcher(e.request.url))
        pending.set(e.requestId, e.request.url);
    });
    cdp.on('Network.responseReceived', async e => {
      if (!pending.has(e.requestId) || captured) return;
      pending.delete(e.requestId);
      try {
        const { postData, base64Encoded } = await cdp.send('Network.getRequestPostData', {
          requestId: e.requestId
        });
        const bytes = base64Encoded
          ? Uint8Array.from(Buffer.from(postData, 'base64'))
          : new TextEncoder().encode(postData);
        captured = { bytes, status: e.response.status };
      } catch {
        /* body evicted */
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await new Promise(r => setTimeout(r, 6000));
    await page
      .evaluate(() => {
        document
          .querySelector('.flip-poster')
          ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        document
          .querySelector('video')
          ?.play?.()
          .catch(() => {});
      })
      .catch(() => {});
    await new Promise(r => setTimeout(r, 18000));

    const consentVisible = await page
      .evaluate(
        () =>
          !!document.querySelector(
            '[aria-modal="true"], form[action*="consent"], ytd-consent-bump-v2-lightbox'
          )
      )
      .catch(() => false);
    if (consentVisible) console.log('  !! consent wall still visible on', url);
  } finally {
    await browser.close();
  }
  return captured;
};

console.log('capturing youtube.com reference request…');
const reference = await captureBody(
  `https://www.youtube.com/watch?v=${videoId}`,
  u => /\.googlevideo\.com/.test(u),
  { consent: true }
);

console.log('capturing ViewTube request…');
const ours = await captureBody(`${viewtube}/watch?v=${videoId}`, u =>
  u.includes('/api/videoplayback')
);

if (!reference || !ours) {
  console.log(`\nmissing capture — reference: ${!!reference}, ours: ${!!ours}`);
  process.exit(1);
}

const decode = c => VideoPlaybackAbrRequest.decode(c.bytes);
const a = decode(reference);
const b = decode(ours);

console.log(`\nreference: ${reference.bytes.length} bytes (http ${reference.status})`);
console.log(`ours:      ${ours.bytes.length} bytes (http ${ours.status})\n`);

const norm = v => (typeof v === 'bigint' ? String(v) : v);
const show = v => {
  if (v === undefined || v === null) return '—';
  if (v instanceof Uint8Array) return `<${v.length} bytes>`;
  if (Array.isArray(v)) return `[${v.length}]`;
  if (typeof v === 'object') return JSON.stringify(v, (k, x) => norm(x)).slice(0, 70);
  return String(v);
};

console.log('=== top level ===');
const topKeys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
for (const k of topKeys) {
  if (k === 'clientAbrState' || k === 'streamerContext') continue;
  const left = show(a[k]);
  const right = show(b[k]);
  console.log(
    `${left === right ? '   ' : '>> '}${k.padEnd(32)} yt=${left.padEnd(26)} ours=${right}`
  );
}

console.log('\n=== clientAbrState (only differences) ===');
const ac = a.clientAbrState ?? {};
const bc = b.clientAbrState ?? {};
for (const k of [...new Set([...Object.keys(ac), ...Object.keys(bc)])]) {
  const left = show(ac[k]);
  const right = show(bc[k]);
  if (left !== right) console.log(`>> ${k.padEnd(38)} yt=${left.padEnd(24)} ours=${right}`);
}

console.log('\n=== streamerContext ===');
const as = a.streamerContext ?? {};
const bs = b.streamerContext ?? {};
for (const k of [...new Set([...Object.keys(as), ...Object.keys(bs)])]) {
  const left = show(as[k]);
  const right = show(bs[k]);
  console.log(
    `${left === right ? '   ' : '>> '}${k.padEnd(28)} yt=${left.padEnd(30)} ours=${right}`
  );
}
