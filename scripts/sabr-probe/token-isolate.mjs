/**
 * Isolates the one variable the other probes confounded: does the po_token matter?
 *
 * Captures a known-good browser request, then replays it with only the token changed.
 * The unmodified re-encode is the control — if that fails, decode/encode is lossy and
 * the whole run is inconclusive.
 */
import {
  SabrError,
  SabrRedirect,
  StreamProtectionStatus,
  UMPPartId,
  VideoPlaybackAbrRequest
} from 'googlevideo/protos';
import { CompositeBuffer, UmpReader } from 'googlevideo/ump';
import puppeteer from 'puppeteer-core';

const videoId = process.argv.includes('--video')
  ? process.argv[process.argv.indexOf('--video') + 1]
  : 'dQw4w9WgXcQ';

const dismissConsent = async page => {
  for (let i = 0; i < 3; i++) {
    const clicked = await page
      .evaluate(() => {
        const wanted = /^(accept all|alle akzeptieren|accept the use|i agree|agree to all)/i;
        const el = [
          ...document.querySelectorAll('button, tp-yt-paper-button, [role="button"]')
        ].find(x =>
          wanted.test(`${x.textContent ?? ''} ${x.getAttribute('aria-label') ?? ''}`.trim())
        );
        if (el) {
          el.click();
          return true;
        }
        const form = document.querySelector('form[action*="consent"]');
        if (form) {
          form.submit();
          return true;
        }
        return false;
      })
      .catch(() => false);
    if (!clicked) return;
    await new Promise(r => setTimeout(r, 2500));
  }
};

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: false,
  args: ['--autoplay-policy=no-user-gesture-required', '--no-first-run', '--mute-audio']
});

let sample = null;
try {
  const page = await browser.newPage();
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');

  const pending = new Map();
  cdp.on('Network.requestWillBeSent', e => {
    if (e.request.method === 'POST' && /\.googlevideo\.com/.test(e.request.url)) {
      pending.set(e.requestId, e.request.url);
    }
  });
  cdp.on('Network.responseReceived', async e => {
    if (!pending.has(e.requestId) || sample) return;
    const url = pending.get(e.requestId);
    pending.delete(e.requestId);
    if (e.response.status !== 200) return;
    try {
      const { postData, base64Encoded } = await cdp.send('Network.getRequestPostData', {
        requestId: e.requestId
      });
      const bytes = base64Encoded
        ? Uint8Array.from(Buffer.from(postData, 'base64'))
        : new TextEncoder().encode(postData);
      sample = { url, bytes };
    } catch {
      /* body evicted from the CDP buffer */
    }
  });

  await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await dismissConsent(page);
  if (!page.url().includes('/watch')) {
    await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await dismissConsent(page);
  }
  await page.evaluate(() => document.querySelector('video')?.play()).catch(() => {});
  await new Promise(r => setTimeout(r, 20000));
} finally {
  await browser.close();
}

if (!sample) {
  console.log('no successful SABR request captured — rerun');
  process.exit(1);
}

const decoded = VideoPlaybackAbrRequest.decode(sample.bytes);
const originalToken = decoded.streamerContext?.poToken;
console.log(`\ncaptured a 200 request, ${sample.bytes.length} bytes`);
console.log(`its po_token: ${originalToken ? `${originalToken.length} bytes` : 'ABSENT'}\n`);

/** A 200 can still carry SABR_ERROR inside the UMP body, so inspect the parts. */
const describeUmp = bytes => {
  const parts = [];
  try {
    new UmpReader(new CompositeBuffer([bytes])).read(part => parts.push(part));
  } catch {
    return 'unparseable UMP';
  }
  if (!parts.length) return 'no UMP parts';

  const names = new Map(Object.entries(UMPPartId).map(([k, v]) => [v, k]));
  const counts = new Map();
  for (const part of parts) counts.set(part.type, (counts.get(part.type) ?? 0) + 1);

  const summary = [...counts.entries()]
    .map(([type, count]) => `${names.get(type) ?? type}×${count}`)
    .join(' ');

  const errorPart = parts.find(p => p.type === UMPPartId.SABR_ERROR);
  const protection = parts.find(p => p.type === UMPPartId.STREAM_PROTECTION_STATUS);

  let extra = '';
  if (errorPart) {
    try {
      const decodedError = SabrError.decode(errorPart.data.getUint8Array(0, errorPart.size));
      extra += ` !! SABR_ERROR ${JSON.stringify(decodedError)}`;
    } catch {
      extra += ' !! SABR_ERROR (undecodable)';
    }
  }
  if (protection) {
    try {
      const status = StreamProtectionStatus.decode(
        protection.data.getUint8Array(0, protection.size)
      );
      extra += ` [protection status=${status.status}]`;
    } catch {
      /* ignore */
    }
  }
  return summary + extra;
};

const parseParts = bytes => {
  const parts = [];
  try {
    new UmpReader(new CompositeBuffer([bytes])).read(part => parts.push(part));
  } catch {
    /* partial */
  }
  return parts;
};

/**
 * The first response is normally a SABR_REDIRECT pointing at the host that actually
 * serves the media, so follow it — a redirect on its own says nothing about the token.
 */
const post = async (url, bytes) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-protobuf' },
    body: bytes
  });
  return { status: res.status, body: new Uint8Array(await res.arrayBuffer()) };
};

const send = async bytes => {
  let { status, body } = await post(sample.url, bytes);
  let hops = 0;

  while (hops < 3) {
    const redirectPart = parseParts(body).find(p => p.type === UMPPartId.SABR_REDIRECT);
    if (!redirectPart) break;
    let target;
    try {
      target = SabrRedirect.decode(redirectPart.data.getUint8Array(0, redirectPart.size)).url;
    } catch {
      break;
    }
    if (!target) break;
    ({ status, body } = await post(target, bytes));
    hops += 1;
  }

  return `${status} ${String(body.length).padStart(7)}b  ${describeUmp(body)}${hops ? ` (after ${hops} redirect${hops > 1 ? 's' : ''})` : ''}`;
};

const withToken = token => {
  const copy = VideoPlaybackAbrRequest.decode(sample.bytes);
  copy.streamerContext.poToken = token;
  return VideoPlaybackAbrRequest.encode(copy).finish();
};

const cases = [
  ['raw captured bytes (control)', sample.bytes],
  ['re-encoded, token unchanged (control)', withToken(originalToken)],
  ['token REMOVED', withToken(undefined)],
  [
    'token replaced with 10 garbage bytes',
    withToken(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))
  ],
  ['token replaced with 110 garbage bytes', withToken(new Uint8Array(110).fill(7))]
];

for (const [label, bytes] of cases) {
  console.log(`${label.padEnd(40)} -> ${await send(bytes)}`);
}
