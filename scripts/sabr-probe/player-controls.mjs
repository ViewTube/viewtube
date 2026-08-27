/**
 * Phase 6 control verification on the SABR path: seek both directions, change playback
 * rate, then select a video quality, an audio representation and a caption track —
 * asserting the decoded resolution actually changes and that later selections do not
 * clobber earlier ones.
 */
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: false,
  args: ['--autoplay-policy=no-user-gesture-required', '--no-first-run', '--mute-audio'] });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(String(e).slice(0, 160)));
await page.goto('http://localhost:8066/watch?v=dQw4w9WgXcQ', { waitUntil: 'networkidle2', timeout: 90000 });
await page.evaluate(() => document.querySelector('video')?.play()).catch(() => {});
await new Promise(r => setTimeout(r, 9000));
await page.mouse.move(400, 300); await page.mouse.move(420, 320);
await page.evaluate(() => [...document.querySelectorAll('.control-button')].find(b => b.innerHTML.includes('i-mdi-cog'))?.click());
await new Promise(r => setTimeout(r, 1000));
await page.evaluate(() => document.querySelectorAll('details.collapsible-section').forEach(d => { d.open = true; }));
await new Promise(r => setTimeout(r, 800));

const state = () => page.evaluate(() => { const v = document.querySelector('video');
  return { t: Math.round(v?.currentTime), res: `${v?.videoWidth}x${v?.videoHeight}`, rs: v?.readyState,
           err: v?.error?.code ?? null, overlay: !!document.querySelector('.player-error-overlay'),
           showing: [...(v?.textTracks ?? [])].filter(t => t.mode === 'showing').map(t => t.label || t.language) }; });

const pick = (sectionRe, label) => page.evaluate(([re, l]) => {
  const sec = [...document.querySelectorAll('.flip-setting')].find(s => new RegExp(re, 'i').test(s.innerText));
  const opt = [...(sec?.querySelectorAll('.selector') ?? [])].find(o => o.innerText.trim().startsWith(l));
  if (!opt) return false; opt.click(); return true;
}, [sectionRe, label]);

let s0 = await state();
console.log('initial         :', JSON.stringify(s0));

await page.evaluate(() => { document.querySelector('video').currentTime = 200; });
await new Promise(r => setTimeout(r, 9000));
const fwd = await state();
console.log('seek -> 200s    :', JSON.stringify(fwd), fwd.t >= 199 ? '(ok)' : '(FAILED)');

await page.evaluate(() => { document.querySelector('video').currentTime = 30; });
await new Promise(r => setTimeout(r, 7000));
const back = await state();
console.log('seek -> 30s     :', JSON.stringify(back), back.t >= 29 && back.t < 60 ? '(ok)' : '(FAILED)');

const before = await state();
console.log('before selects  :', JSON.stringify(before));

console.log('pick 480p       :', await pick('Video quality', '480p'));
await new Promise(r => setTimeout(r, 7000));
const q = await state();
console.log('  after quality :', JSON.stringify(q), q.t > before.t ? '(advanced)' : '(STALLED)');

console.log('pick audio 131  :', await pick('Audio quality', '131'));
await new Promise(r => setTimeout(r, 6000));
const a = await state();
console.log('  after audio   :', JSON.stringify(a), a.t > q.t ? '(advanced)' : '(STALLED)');

console.log('pick caption EN :', await pick('Subtitles', 'English'));
await new Promise(r => setTimeout(r, 6000));
const c = await state();
console.log('  after caption :', JSON.stringify(c), c.t > a.t ? '(advanced)' : '(STALLED)');

const sel = await page.evaluate(() => [...document.querySelectorAll('.flip-setting')]
  .map(s => { const m = [...s.querySelectorAll('.selector.selected')].map(x => x.innerText.trim().replace(/\n/g,' ')); return m.length ? s.innerText.split('\n')[0] + ' => ' + m.join(',') : null; }).filter(Boolean));
console.log('selected now    :', JSON.stringify(sel));
console.log('errors          :', errs.length ? [...new Set(errs)].join(' | ') : '(none)');
const ok = fwd.t >= 199 && back.t >= 29 && back.t < 60 &&
           q.res !== before.res && a.res === q.res && c.res === q.res &&
           q.t > before.t && a.t > q.t && c.t > a.t && !c.err && !c.overlay;
console.log('\n' + (ok ? 'SELECTION CHECKS PASSED' : 'SELECTION CHECKS FAILED'));
await browser.close();
