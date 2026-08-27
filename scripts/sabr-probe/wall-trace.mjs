/**
 * Like `ump-trace`, but decodes the server's *directives* instead of only naming them.
 *
 * A response carrying policies and no media is the server declining to serve. Naming the
 * parts is not enough to tell *why*: `STREAM_PROTECTION_STATUS` is the field that
 * separates a video that plays to the end (status 1) from one YouTube wants attestation
 * for and cuts off about a minute in (status 2, set from the very first response). Every
 * non-media part is base64'd out of the page and decoded here.
 *
 * `--start <seconds>` begins the session at a position rather than seeking there later;
 * that is what showed the cutoff is a per-session media budget and not a readahead cap.
 */
import {
  MediaHeader,
  NextRequestPolicy,
  PlaybackStartPolicy,
  RequestCancellationPolicy,
  SabrError,
  SabrRedirect,
  StreamProtectionStatus,
  VideoPlaybackAbrRequest
} from 'googlevideo/protos';
import puppeteer from 'puppeteer-core';

const reqByRn = new Map();
const fid = f => (f && f.itag ? `${f.itag}${f.xtags ? ':' + f.xtags.slice(0, 12) : ''}` : '-');

const describeRequest = body => {
  const r = VideoPlaybackAbrRequest.decode(new Uint8Array(body));
  return (
    `t=${r.clientAbrState?.playerTimeMs} bits=${r.clientAbrState?.enabledTrackTypesBitfield} ` +
    `prefV=${(r.preferredVideoFormatIds ?? []).map(fid).join(',')} ` +
    `prefA=${(r.preferredAudioFormatIds ?? []).map(fid).join(',')} ` +
    `sel=${(r.selectedFormatIds ?? []).map(fid).join(',')} ` +
    `buf=[${(r.bufferedRanges ?? [])
      .map(
        b =>
          `${fid(b.formatId)}:${b.startTimeMs}+${b.durationMs}#${b.startSegmentIndex}-${b.endSegmentIndex}`
      )
      .join(' ')}]`
  );
};

const DECODERS = {
  20: ['MEDIA_HEADER', MediaHeader],
  35: ['NEXT_REQUEST_POLICY', NextRequestPolicy],
  43: ['SABR_REDIRECT', SabrRedirect],
  44: ['SABR_ERROR', SabrError],
  47: ['PLAYBACK_START_POLICY', PlaybackStartPolicy],
  53: ['REQUEST_CANCELLATION_POLICY', RequestCancellationPolicy],
  58: ['STREAM_PROTECTION_STATUS', StreamProtectionStatus]
};

const compact = value =>
  JSON.stringify(value, (_, v) => {
    if (v instanceof Object && v.type === 'Buffer') return `<${v.data.length}B>`;
    return v;
  });

const arg = (n, d) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : d);
const videoId = arg('--video', 'dQw4w9WgXcQ');
const base = arg('--base', 'http://localhost:8066');
const seconds = Number(arg('--seconds', '30'));
// Seeking *before* the wall is reached is a different experiment from seeking after it:
// it asks whether the server will serve a position at all, rather than whether it will
// resume once it has stopped.
const seekTo = process.argv.includes('--seek') ? Number(arg('--seek', '100')) : null;
const seekAfter = Number(arg('--seek-after', '15'));

const browser = await puppeteer.launch({
  executablePath: arg('--chrome', '/usr/bin/chromium'),
  headless: false,
  args: ['--autoplay-policy=no-user-gesture-required', '--no-first-run', '--mute-audio']
});

const lines = [];

try {
  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    const readVarInt = (b, o) => {
      if (o >= b.length) return [-1, o];
      const f = b[o];
      const len = f < 128 ? 1 : f < 192 ? 2 : f < 224 ? 3 : f < 240 ? 4 : 5;
      if (o + len > b.length) return [-1, o];
      let v;
      if (len === 1) v = b[o];
      else if (len === 2) v = (b[o] & 0x3f) + 64 * b[o + 1];
      else if (len === 3) v = (b[o] & 0x1f) + 32 * (b[o + 1] + 256 * b[o + 2]);
      else if (len === 4) v = (b[o] & 0x0f) + 16 * (b[o + 1] + 256 * (b[o + 2] + 256 * b[o + 3]));
      else v = b[o + 1] + 256 * (b[o + 2] + 256 * (b[o + 3] + 256 * b[o + 4]));
      return [v, o + len];
    };
    const b64 = bytes => {
      let s = '';
      for (const byte of bytes) s += String.fromCharCode(byte);
      return btoa(s);
    };

    const originalFetch = window.fetch;
    let n = 0;
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input?.url;
      const res = await originalFetch(input, init);
      if (!url || !url.includes('/api/videoplayback') || !res.body) return res;

      const id = n++;
      const rn = new URL(url, location.origin).searchParams.get('rn');
      const [toCaller, toTrace] = res.body.tee();

      (async () => {
        const reader = toTrace.getReader();
        const chunks = [];
        let total = 0;
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            total += value.length;
          }
        } catch {
          // The adapter aborts the stream once it has its segment.
        }
        const all = new Uint8Array(total);
        let off = 0;
        for (const c of chunks) {
          all.set(c, off);
          off += c.length;
        }

        const parts = [];
        let media = 0;
        let o = 0;
        while (o < all.length) {
          const [type, o1] = readVarInt(all, o);
          if (type < 0) break;
          const [size, o2] = readVarInt(all, o1);
          if (size < 0 || o2 + size > all.length) break;
          if (type === 21 || type === 22) media++;
          else parts.push(`${type}:${b64(all.subarray(o2, o2 + size))}`);
          o = o2 + size;
        }
        console.log(`WALL ${id}|${rn}|${total}|${media}|${parts.join(',')}`);
      })();

      return new Response(toCaller, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers
      });
    };
  });

  page.on('request', req => {
    const url = req.url();
    if (!url.includes('/api/videoplayback')) return;
    const postData = req.postData();
    if (!postData) return;
    const rn = new URL(url).searchParams.get('rn');
    const list = reqByRn.get(rn) ?? [];
    try {
      list.push(describeRequest(Buffer.from(postData, 'binary')));
    } catch {
      list.push('decode-failed');
    }
    reqByRn.set(rn, list);
  });

  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  // VERBOSE=1 echoes the page's own console. A trace with no pairs at all usually means
  // the watch page never got video data, which shows up there and nowhere else.
  page.on('console', m => {
    if (process.env.VERBOSE) console.log('CONSOLE', m.type(), m.text().slice(0, 200));
    if (m.text().startsWith('WALL ')) lines.push(m.text().slice(5));
  });

  // `--start` uses the watch page's own `?t=` so the session begins at that position,
  // which is a different question from seeking there afterwards.
  const startAt = arg('--start', null);
  await page.goto(`${base}/watch?v=${videoId}${startAt ? `&t=${startAt}` : ''}`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000
  });
  await new Promise(r => setTimeout(r, 9000));
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

  if (seekTo === null) {
    await new Promise(r => setTimeout(r, seconds * 1000));
  } else {
    await new Promise(r => setTimeout(r, seekAfter * 1000));
    lines.push(`--- seeking to ${seekTo} ---`);
    await page.evaluate(t => {
      document.querySelector('video').currentTime = t;
    }, seekTo);
    await new Promise(r => setTimeout(r, seconds * 1000));
  }

  const state = await page.evaluate(() => {
    const v = document.querySelector('video');
    if (!v) return null;
    const ranges = [];
    for (let i = 0; i < v.buffered.length; i++) {
      ranges.push(`${v.buffered.start(i).toFixed(1)}-${v.buffered.end(i).toFixed(1)}`);
    }
    return {
      currentTime: +v.currentTime.toFixed(1),
      buffered: ranges,
      messages: [...document.querySelectorAll('.message, .message-box')].map(m =>
        (m.textContent ?? '').trim().slice(0, 160)
      )
    };
  });

  for (const line of lines) {
    if (line.startsWith('---')) {
      console.log(`\n${line}`);
      continue;
    }
    const [id, rn, total, media, rest] = line.split('|');
    console.log(`\n#${id} rn=${rn} ${total}B media=${media}`);
    const req = reqByRn.get(rn)?.shift();
    if (req) console.log(`  REQ ${req}`);
    for (const part of (rest || '').split(',').filter(Boolean)) {
      const sep = part.indexOf(':');
      const type = Number(part.slice(0, sep));
      const bytes = Buffer.from(part.slice(sep + 1), 'base64');
      const decoder = DECODERS[type];
      if (!decoder) {
        console.log(`  ${type} <${bytes.length}B>`);
        continue;
      }
      try {
        console.log(`  ${decoder[0]} ${compact(decoder[1].decode(new Uint8Array(bytes)))}`);
      } catch {
        console.log(`  ${decoder[0]} <undecodable ${bytes.length}B>`);
      }
    }
  }
  console.log('\nvideo:', JSON.stringify(state));
} finally {
  await browser.close();
}
