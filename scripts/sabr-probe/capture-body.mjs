/**
 * Captures the VideoPlaybackAbrRequest a real browser sends and decodes it, so our own
 * request can be diffed against ground truth.
 */
import { VideoPlaybackAbrRequest } from 'googlevideo/protos';
import puppeteer from 'puppeteer-core';

const videoId = process.argv.includes('--video')
  ? process.argv[process.argv.indexOf('--video') + 1]
  : 'dQw4w9WgXcQ';

/**
 * YouTube's consent wall varies by region and blocks playback until dismissed. Match on
 * aria-label as well as text, and cover the separate consent.youtube.com form.
 */
const dismissConsent = async page => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const clicked = await page
      .evaluate(() => {
        const wanted = /^(accept all|alle akzeptieren|accept the use|i agree|agree to all)/i;
        const candidates = [
          ...document.querySelectorAll('button, tp-yt-paper-button, [role="button"]')
        ];
        const match = candidates.find(el => {
          const text = `${el.textContent ?? ''} ${el.getAttribute('aria-label') ?? ''}`.trim();
          return wanted.test(text);
        });
        if (match) {
          match.click();
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

const captured = [];

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
    const url = pending.get(event.requestId);
    pending.delete(event.requestId);
    try {
      const { postData, base64Encoded } = await cdp.send('Network.getRequestPostData', {
        requestId: event.requestId
      });
      const bytes = base64Encoded
        ? Uint8Array.from(Buffer.from(postData, 'base64'))
        : new TextEncoder().encode(postData);
      captured.push({ url, status: event.response.status, bytes });
    } catch {
      // Body already evicted from the CDP buffer.
    }
  });

  await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await dismissConsent(page);
  // Consent can navigate away from the watch page; make sure we end up back on it.
  if (!page.url().includes('/watch')) {
    await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await dismissConsent(page);
  }
  await page.evaluate(() => document.querySelector('video')?.play()).catch(() => {});
  await new Promise(r => setTimeout(r, 22000));
} finally {
  await browser.close();
}

console.log(`\ncaptured ${captured.length} SABR request bodies`);
const sample = captured.find(c => c.status === 200) ?? captured[0];
if (!sample) {
  console.log('none captured — the page may not have started playing');
  process.exit(1);
}

console.log(`status ${sample.status}, ${sample.bytes.length} body bytes\n`);
const decoded = VideoPlaybackAbrRequest.decode(sample.bytes);

const ctx = decoded.streamerContext ?? {};
console.log('--- decoded browser request ---');
console.log('clientAbrState keys :', Object.keys(decoded.clientAbrState ?? {}).join(', '));
console.log(
  'clientAbrState      :',
  JSON.stringify(decoded.clientAbrState, (k, v) => (typeof v === 'bigint' ? String(v) : v))
);
console.log(
  'selectedFormatIds   :',
  JSON.stringify(decoded.selectedFormatIds, (k, v) => (typeof v === 'bigint' ? String(v) : v))
);
console.log('bufferedRanges      :', decoded.bufferedRanges?.length ?? 0);
console.log(
  'preferredAudio/Video:',
  decoded.preferredAudioFormatIds?.length,
  '/',
  decoded.preferredVideoFormatIds?.length
);
console.log('ustreamerConfig len :', decoded.videoPlaybackUstreamerConfig?.length ?? 0);
console.log('streamerContext:');
console.log('  poToken bytes     :', ctx.poToken?.length ?? 'ABSENT');
console.log('  clientInfo        :', JSON.stringify(ctx.clientInfo));
console.log('  playbackCookie    :', ctx.playbackCookie ? 'present' : 'absent');
console.log('  sabrContexts      :', ctx.sabrContexts?.length ?? 0);
console.log('  field5/field6     :', ctx.field5?.length ?? 0, '/', ctx.field6?.length ?? 0);

// Can the exact same bytes succeed from outside the browser? If yes, nothing about the
// browser environment is required and the gap is purely how we build the request.
const replay = await fetch(sample.url, {
  method: 'POST',
  headers: { 'content-type': 'application/x-protobuf' },
  body: sample.bytes
});
const replayBytes = new Uint8Array(await replay.arrayBuffer()).length;
console.log(`\nreplay of captured body from node -> ${replay.status} (${replayBytes} bytes)`);
console.log(
  replay.status === 200
    ? '=> Reproducible outside Chrome. Match these fields and SABR works from the server.'
    : '=> Replay refused; the request is bound to browser/session state beyond the body.'
);
