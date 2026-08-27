/**
 * Takes ViewTube's own (rejected) request and patches it field-by-field toward the shape
 * youtube.com sends, to find which difference YouTube is actually rejecting.
 */
import { SabrRedirect, UMPPartId, VideoPlaybackAbrRequest } from 'googlevideo/protos';
import { CompositeBuffer, UmpReader } from 'googlevideo/ump';
import puppeteer from 'puppeteer-core';

const arg = n => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : undefined);
const videoId = arg('--video') ?? 'dQw4w9WgXcQ';
const viewtube = arg('--base') ?? 'http://localhost:8066';

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
    if (e.request.method === 'POST' && e.request.url.includes('/api/videoplayback'))
      pending.set(e.requestId, e.request.url);
  });
  cdp.on('Network.responseReceived', async e => {
    if (!pending.has(e.requestId) || sample) return;
    const url = pending.get(e.requestId);
    pending.delete(e.requestId);
    try {
      const { postData, base64Encoded } = await cdp.send('Network.getRequestPostData', {
        requestId: e.requestId
      });
      sample = {
        url,
        bytes: base64Encoded
          ? Uint8Array.from(Buffer.from(postData, 'base64'))
          : new TextEncoder().encode(postData)
      };
    } catch {
      /* evicted */
    }
  });
  await page.goto(`${viewtube}/watch?v=${videoId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000
  });
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
  await new Promise(r => setTimeout(r, 15000));
} finally {
  await browser.close();
}

if (!sample) {
  console.log('no ViewTube SABR request captured');
  process.exit(1);
}
console.log(`captured our request: ${sample.bytes.length} bytes\n`);

const parts = bytes => {
  const out = [];
  try {
    new UmpReader(new CompositeBuffer([bytes])).read(p => out.push(p));
  } catch {
    /* partial */
  }
  return out;
};

const post = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-protobuf' },
    body
  });
  return { status: res.status, body: new Uint8Array(await res.arrayBuffer()) };
};

/** Follow SABR_REDIRECT so a 200 means media, not just a redirect. */
const send = async body => {
  let { status, body: out } = await post(sample.url, body);
  for (let hop = 0; hop < 3; hop++) {
    const redirect = parts(out).find(p => p.type === UMPPartId.SABR_REDIRECT);
    if (!redirect) break;
    let target;
    try {
      target = SabrRedirect.decode(redirect.data.getUint8Array(0, redirect.size)).url;
    } catch {
      break;
    }
    if (!target) break;
    ({ status, body: out } = await post(target, body));
  }
  const names = new Map(Object.entries(UMPPartId).map(([k, v]) => [v, k]));
  const summary = [
    ...parts(out).reduce((m, p) => m.set(p.type, (m.get(p.type) ?? 0) + 1), new Map())
  ]
    .map(([t, c]) => `${names.get(t) ?? t}×${c}`)
    .join(' ');
  return `${status} ${String(out.length).padStart(7)}b ${summary || '-'}`;
};

const patched = mutate => {
  const req = VideoPlaybackAbrRequest.decode(sample.bytes);
  mutate(req);
  return VideoPlaybackAbrRequest.encode(req).finish();
};

const cases = [
  ['control (unmodified)', () => {}],
  [
    'enabledTrackTypesBitfield = 3',
    r => {
      r.clientAbrState.enabledTrackTypesBitfield = 3;
    }
  ],
  [
    'clientInfo deviceMake cleared',
    r => {
      r.streamerContext.clientInfo.deviceMake = '';
    }
  ],
  [
    'clientInfo osName = X11',
    r => {
      r.streamerContext.clientInfo.osName = 'X11';
      r.streamerContext.clientInfo.osVersion = '';
    }
  ],
  [
    'viewport set (640x360)',
    r => {
      r.clientAbrState.clientViewportWidth = 640;
      r.clientAbrState.clientViewportHeight = 360;
    }
  ],
  [
    'clear selected+preferred formats',
    r => {
      r.selectedFormatIds = [];
      r.preferredAudioFormatIds = [];
      r.preferredVideoFormatIds = [];
    }
  ],
  [
    'clear bufferedRanges',
    r => {
      r.bufferedRanges = [];
    }
  ],
  [
    'drcEnabled = true',
    r => {
      r.clientAbrState.drcEnabled = true;
    }
  ],
  [
    'playbackRate = 0',
    r => {
      r.clientAbrState.playbackRate = 0;
    }
  ],
  [
    'all clientAbrState tweaks',
    r => {
      r.clientAbrState.enabledTrackTypesBitfield = 3;
      r.clientAbrState.clientViewportWidth = 640;
      r.clientAbrState.clientViewportHeight = 360;
      r.clientAbrState.drcEnabled = true;
      r.clientAbrState.playbackRate = 0;
      r.clientAbrState.av1QualityThreshold = 1080;
    }
  ],
  [
    'everything combined',
    r => {
      r.clientAbrState.enabledTrackTypesBitfield = 3;
      r.clientAbrState.clientViewportWidth = 640;
      r.clientAbrState.clientViewportHeight = 360;
      r.clientAbrState.drcEnabled = true;
      r.clientAbrState.playbackRate = 0;
      r.clientAbrState.av1QualityThreshold = 1080;
      r.streamerContext.clientInfo.deviceMake = '';
      r.streamerContext.clientInfo.osName = 'X11';
      r.streamerContext.clientInfo.osVersion = '';
      r.selectedFormatIds = [];
      r.preferredAudioFormatIds = [];
      r.preferredVideoFormatIds = [];
      r.bufferedRanges = [];
    }
  ]
];

for (const [label, mutate] of cases) {
  console.log(`${label.padEnd(36)} -> ${await send(patched(mutate))}`);
}
