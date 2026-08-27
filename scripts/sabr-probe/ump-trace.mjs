/**
 * Traces one ViewTube playback session at the protocol level: every SABR request the
 * player sends, paired with the UMP parts YouTube answered with.
 *
 * This is the only probe that sees a *response body*. Puppeteer's `response.buffer()`
 * cannot read the SABR responses — they are streamed, and the adapter aborts the stream
 * as soon as it has its segment — so the page's own `fetch` is wrapped and the body teed
 * before the adapter consumes it. The UMP framing is parsed inline rather than through
 * googlevideo, which needs the whole stream to hand back a result.
 *
 * Needs both dev servers up. Read the output as pairs:
 *
 *     SABRTEE #14 rn=17 668694B :: ... MEDIA_HEADERx2 MEDIAx21 MEDIA_END
 *             REQ t=33542 bits=2 prefV=398 prefA=140 sel=140,398 buf=[398:0+5417#6-6 ...]
 *
 * `bits` is `EnabledTrackTypes` — 1 audio-only, 2 video-only. `buf` entries are
 * `<itag>:<startMs>+<durationMs>#<startSegment>-<endSegment>`; a duration of 2147483647
 * is googlevideo's "do not send this track" marker. A response of ~90 bytes carrying only
 * policies is the server declining to serve media, which reaches Shaka as a failed
 * segment. This probe only *names* the parts; `wall-trace.mjs` decodes them, which is what
 * it takes to tell a temporary decline from YouTube's attestation gate — see the
 * attestation-gate section of SABR_PLAN.md.
 */
import { VideoPlaybackAbrRequest } from 'googlevideo/protos';
import puppeteer from 'puppeteer-core';

const reqByRn = new Map();
const describe = body => {
  try {
    const r = VideoPlaybackAbrRequest.decode(new Uint8Array(body));
    const fid = f => (f && f.itag ? `${f.itag}${f.xtags ? ':' + f.xtags.slice(0, 10) : ''}` : '-');
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
  } catch {
    return 'decode-failed';
  }
};

const arg = (n, d) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : d);
const videoId = arg('--video', 'dQw4w9WgXcQ');
const base = arg('--base', 'http://localhost:8066');
const seconds = Number(arg('--seconds', '30'));
const seekTo = process.argv.includes('--seek') ? Number(arg('--seek', '100')) : null;

const browser = await puppeteer.launch({
  executablePath: arg('--chrome', '/usr/bin/chromium'),
  headless: false,
  args: ['--autoplay-policy=no-user-gesture-required', '--no-first-run', '--mute-audio']
});

const lines = [];

try {
  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    const NAMES = {
      20: 'MEDIA_HEADER',
      21: 'MEDIA',
      22: 'MEDIA_END',
      35: 'NEXT_REQUEST_POLICY',
      42: 'FORMAT_INIT_METADATA',
      43: 'SABR_REDIRECT',
      44: 'SABR_ERROR',
      45: 'SABR_SEEK',
      46: 'RELOAD_PLAYER_RESPONSE',
      47: 'PLAYBACK_START_POLICY',
      51: 'SELECTABLE_FORMATS',
      52: 'REQUEST_IDENTIFIER',
      53: 'REQUEST_CANCELLATION_POLICY',
      57: 'SABR_CONTEXT_UPDATE',
      58: 'STREAM_PROTECTION_STATUS',
      59: 'SABR_CONTEXT_SENDING_POLICY',
      61: 'SABR_ACK',
      62: 'END_OF_TRACK'
    };
    // UMP's varint is length-prefixed by the top bits of its first byte, not continuation
    // bits, so it cannot be read with a protobuf varint reader.
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
    const parseUmp = bytes => {
      const out = [];
      let o = 0;
      while (o < bytes.length) {
        const [type, o1] = readVarInt(bytes, o);
        if (type < 0) break;
        const [size, o2] = readVarInt(bytes, o1);
        if (size < 0) break;
        if (o2 + size > bytes.length) {
          out.push(`${NAMES[type] ?? type}[truncated]`);
          break;
        }
        out.push(NAMES[type] ?? String(type));
        o = o2 + size;
      }
      return out;
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
          // The adapter aborts the stream once it has its segment; what arrived is enough.
        }
        const all = new Uint8Array(total);
        let off = 0;
        for (const c of chunks) {
          all.set(c, off);
          off += c.length;
        }
        const counts = {};
        for (const part of parseUmp(all)) counts[part] = (counts[part] ?? 0) + 1;
        console.log(
          `SABRTEE #${id} rn=${rn} ${total}B :: ` +
            Object.entries(counts)
              .map(([k, v]) => (v > 1 ? `${k}x${v}` : k))
              .join(' ')
        );
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
    list.push(describe(Buffer.from(postData, 'binary')));
    reqByRn.set(rn, list);
  });

  page.on('console', m => {
    if (m.text().startsWith('SABRTEE')) lines.push(m.text());
  });

  await page.goto(`${base}/watch?v=${videoId}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
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
    await new Promise(r => setTimeout(r, 15000));
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
      resolution: `${v.videoWidth}x${v.videoHeight}`,
      buffered: ranges,
      toasts: document.querySelectorAll('.message-box, .message').length
    };
  });

  for (const line of lines) {
    console.log(line);
    const rn = line.match(/rn=(\d+)/);
    if (rn && reqByRn.has(rn[1])) {
      console.log('        REQ ' + (reqByRn.get(rn[1]).shift() ?? '(same rn, already shown)'));
    }
  }
  console.log('\nvideo:', JSON.stringify(state));
} finally {
  await browser.close();
}
