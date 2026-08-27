/**
 * Proves the SABR reload actually swaps the live session.
 *
 * `ei`/`expire` come back identical on a refetch, so they cannot distinguish an applied
 * swap from an ignored one. Instead the refetch response is intercepted and its streaming
 * URL tagged; if later segment POSTs carry the tag, applySource definitely took effect.
 */
import puppeteer from 'puppeteer-core';

const videoId = process.argv[2] ?? 'dQw4w9WgXcQ';
const MARKER = '__vtreloadmarker';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium', headless: false,
  args: ['--autoplay-policy=no-user-gesture-required', '--no-first-run', '--mute-audio']
});
const page = await browser.newPage();

let interceptNext = false;
let injected = false;
const vp = [];
const errors = [];
page.on('pageerror', e => errors.push(String(e).slice(0, 200)));

await page.setRequestInterception(true);
page.on('request', async req => {
  const url = req.url();
  if (/\/api\/videoplayback/.test(url)) vp.push(url.includes(MARKER));

  if (interceptNext && new RegExp(`/api/videos/${videoId}(\\?|$)`).test(url)) {
    interceptNext = false;
    try {
      const res = await fetch(`http://localhost:8067/api/videos/${videoId}`);
      const body = await res.json();
      const u = new URL(body.sabr.streamingUrl);
      u.searchParams.set(MARKER, '1');
      body.sabr.streamingUrl = u.toString();
      injected = true;
      return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    } catch (e) {
      errors.push('inject failed: ' + e.message);
    }
  }
  req.continue();
});

await page.goto(`http://localhost:8066/watch?v=${videoId}`, { waitUntil: 'networkidle2', timeout: 90000 });
await page.evaluate(() => document.querySelector('video')?.play()).catch(() => {});
await new Promise(r => setTimeout(r, 12000));

const before = await page.evaluate(() => {
  const v = document.querySelector('video');
  return { t: v?.currentTime, hook: typeof window.__vtSabrReload === 'function' };
});
const vpBefore = vp.length;

interceptNext = true;
const reloadResult = await page.evaluate(async () => {
  try { await window.__vtSabrReload(); return 'resolved'; } catch (e) { return 'threw: ' + String(e).slice(0, 120); }
});

await new Promise(r => setTimeout(r, 15000));
const after = await page.evaluate(() => {
  const v = document.querySelector('video');
  return { t: v?.currentTime, paused: v?.paused, readyState: v?.readyState,
           err: v?.error?.code ?? null, overlay: !!document.querySelector('.player-error-overlay') };
});

const post = vp.slice(vpBefore);
const tagged = post.filter(Boolean).length;

console.log('hook present        :', before.hook);
console.log('reload call         :', reloadResult);
console.log('marker injected     :', injected);
console.log('segment reqs after  :', post.length, `(${tagged} carry the new session's marker)`);
console.log('playback            :', `${before.t?.toFixed(1)}s -> ${after.t?.toFixed(1)}s`, JSON.stringify(after));
console.log('errors              :', errors.length ? errors.join(' | ') : '(none)');

const ok = injected && tagged > 0 && after.t > before.t && !after.err && !after.overlay;
console.log(ok ? '\nRELOAD VERIFIED — new session is in use and playback never stopped'
               : '\nRELOAD NOT VERIFIED');
await browser.close();
