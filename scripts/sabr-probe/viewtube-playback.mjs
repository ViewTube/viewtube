/** End-to-end: does a video actually play in ViewTube itself? */
import puppeteer from 'puppeteer-core';

const videoId = process.argv.includes('--video')
  ? process.argv[process.argv.indexOf('--video') + 1]
  : 'dQw4w9WgXcQ';
const base = process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : 'http://localhost:8066';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: false,
  args: ['--autoplay-policy=no-user-gesture-required', '--no-first-run', '--mute-audio']
});

const playbackCalls = [];
const consoleErrors = [];

try {
  const page = await browser.newPage();
  // Shaka's compiled build minifies error names to single letters; serialise the actual
  // fields (code/category/severity/data) instead of relying on message.
  await page.evaluateOnNewDocument(() => {
    window.__errors = [];
    const record = err => {
      try {
        window.__errors.push(
          JSON.stringify({
            name: err?.name,
            message: err?.message,
            code: err?.code,
            category: err?.category,
            severity: err?.severity,
            data: err?.data
              ? JSON.parse(JSON.stringify(err.data, (k, v) => (v instanceof Error ? String(v) : v)))
              : undefined,
            stack: String(err?.stack ?? '')
              .split('\n')
              .slice(0, 3)
              .join(' | ')
          })
        );
      } catch {
        window.__errors.push(String(err));
      }
    };
    window.addEventListener('error', e => record(e.error ?? e));
    window.addEventListener('unhandledrejection', e => record(e.reason));
  });
  page.on('console', async m => {
    if (m.type() !== 'error' && m.type() !== 'warning' && !m.text().includes('SABRDBG')) return;
    const parts = await Promise.all(m.args().map(a => a.jsonValue().catch(() => a.toString())));
    consoleErrors.push(
      `${m.type()}: ${parts
        .map(x => (typeof x === 'object' ? JSON.stringify(x) : String(x)))
        .join(' ')
        .slice(0, 400)}`
    );
  });
  page.on('pageerror', e =>
    consoleErrors.push(`pageerror: ${String(e?.message)} :: ${String(e?.stack).slice(0, 400)}`)
  );
  page.on('response', res => {
    const u = res.url();
    if (u.includes('/api/videoplayback')) {
      playbackCalls.push(
        `${res.request().method()} ${res.status()} ${res.headers()['content-type'] ?? ''}`
      );
    }
  });

  await page.goto(`${base}/watch?v=${videoId}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await new Promise(r => setTimeout(r, 8000));

  // Click the poster to start playback.
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

  await new Promise(r => setTimeout(r, 25000));

  const ui = await page
    .evaluate(() => {
      const overlay = document.querySelector('.flip-player-error-overlay');
      const spinner = document.querySelector('.flip-spinner');
      const visible = el =>
        !!el &&
        getComputedStyle(el).display !== 'none' &&
        getComputedStyle(el).visibility !== 'hidden';
      return {
        errorOverlayVisible: visible(overlay),
        errorTitle: overlay?.querySelector('.error-title')?.textContent?.trim() ?? null,
        errorMessage: overlay?.querySelector('.error-message')?.textContent?.trim() ?? null,
        retryButton: !!overlay?.querySelector('.error-retry'),
        spinnerVisible: visible(spinner)
      };
    })
    .catch(() => null);

  const state = await page.evaluate(() => {
    const v = document.querySelector('video');
    if (!v) return null;
    return {
      currentTime: v.currentTime,
      readyState: v.readyState,
      paused: v.paused,
      buffered: v.buffered.length ? v.buffered.end(v.buffered.length - 1) : 0,
      error: v.error ? v.error.message || `code ${v.error.code}` : null
    };
  });

  console.log('\n=== ViewTube playback ===');
  console.log('error overlay:', ui ? JSON.stringify(ui, null, 1) : 'could not read');
  console.log('video element:', state ? JSON.stringify(state) : 'NOT FOUND');
  console.log(`\n/api/videoplayback calls: ${playbackCalls.length}`);
  for (const c of [...new Set(playbackCalls)].slice(0, 6)) console.log('  ', c);
  if (consoleErrors.length) {
    console.log('\nconsole (in order):');
    consoleErrors.forEach((e, i) => console.log(`  [${i}]`, e.slice(0, 220)));
  }
  const pageErrors = await page.evaluate(() => window.__errors ?? []).catch(() => []);
  if (pageErrors.length) {
    console.log('\nstructured errors:');
    for (const e of [...new Set(pageErrors)].slice(0, 6)) console.log('  ', e);
  }

  console.log('\n--- verdict ---');
  console.log(
    (state?.currentTime ?? 0) > 1
      ? 'PLAYING — SABR works end to end in ViewTube.'
      : 'NOT PLAYING — see errors above.'
  );
} finally {
  await browser.close();
}
