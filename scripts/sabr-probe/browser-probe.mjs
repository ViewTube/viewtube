/**
 * Ground truth: what does a real browser get from the SABR endpoint on this machine?
 *
 * Answers the question sabr-probe.mjs cannot: when every po_token strategy is refused,
 * is the request wrong, or is this network refused outright? If Chromium plays the video
 * here, the endpoint is reachable and our request/token is the problem. If Chromium is
 * refused too, no amount of token work will help.
 */
import puppeteer from 'puppeteer-core';

const args = process.argv.slice(2);
const argValue = name => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const videoId = argValue('--video') ?? 'dQw4w9WgXcQ';
const chromePath = argValue('--chrome') ?? '/usr/bin/chromium';
const headless = args.includes('--headless');
const seconds = Number(argValue('--seconds') ?? 25);

const playback = [];

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless,
  args: ['--autoplay-policy=no-user-gesture-required', '--no-first-run', '--mute-audio']
});

try {
  const page = await browser.newPage();

  page.on('response', response => {
    const request = response.request();
    let host;
    try {
      host = new URL(request.url()).hostname;
    } catch {
      return;
    }
    if (!host.endsWith('.googlevideo.com')) return;

    playback.push({
      method: request.method(),
      status: response.status(),
      contentType: response.headers()['content-type'] ?? '',
      url: request.url()
    });
  });

  console.log(
    `opening youtube.com/watch?v=${videoId} in ${headless ? 'headless' : 'headful'} Chromium…`
  );
  await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // Dismiss a consent interstitial if one appears, otherwise playback never starts.
  await page
    .evaluate(() => {
      const button = [...document.querySelectorAll('button')].find(b =>
        /accept|agree|reject/i.test(b.textContent ?? '')
      );
      button?.click();
    })
    .catch(() => {});

  await new Promise(resolve => setTimeout(resolve, seconds * 1000));

  const state = await page
    .evaluate(() => {
      const video = document.querySelector('video');
      if (!video) return null;
      return { currentTime: video.currentTime, readyState: video.readyState, paused: video.paused };
    })
    .catch(() => null);

  const sabr = playback.filter(entry => entry.method === 'POST');
  const other = playback.filter(entry => entry.method !== 'POST');

  console.log(
    `\ngooglevideo requests seen: ${playback.length} (${sabr.length} POST / ${other.length} GET)`
  );

  const summarise = entries => {
    const byStatus = new Map();
    for (const entry of entries) byStatus.set(entry.status, (byStatus.get(entry.status) ?? 0) + 1);
    return [...byStatus.entries()].map(([status, count]) => `${status}×${count}`).join(' ');
  };

  if (sabr.length) console.log(`  POST (SABR) statuses: ${summarise(sabr)}`);
  if (other.length) console.log(`  GET  statuses:        ${summarise(other)}`);

  if (sabr.length) {
    const sample = new URL(sabr[0].url);
    console.log(`\n  sample SABR url: ${sample.origin}${sample.pathname}`);
    console.log(`  query params:    ${[...sample.searchParams.keys()].join(', ')}`);
    console.log(`  content-type:    ${sabr[0].contentType}`);
  }

  console.log(
    `\nvideo element: ${state ? `currentTime=${state.currentTime.toFixed(1)}s readyState=${state.readyState} paused=${state.paused}` : 'not found'}`
  );

  const played = (state?.currentTime ?? 0) > 0.5;
  const sabrOk = sabr.some(entry => entry.status === 200);

  console.log('\n--- verdict ---');
  if (played && sabrOk) {
    console.log('Chromium played the video and SABR returned 200 on this network.');
    console.log('=> The endpoint is reachable. Our 403s are the request or the po_token,');
    console.log('   so minting the token in a real browser is the fix to try next.');
  } else if (played && !sabr.length) {
    console.log('Chromium played, but over GET segment URLs rather than SABR POSTs.');
    console.log('=> This client is not on the SABR path; compare what player config it got.');
  } else if (!played) {
    console.log('Chromium did NOT play the video on this network.');
    console.log('=> Consistent with a network/IP-level block. Token work will not help;');
    console.log('   re-run from a different network before building anything.');
  } else {
    console.log('Mixed result — inspect the statuses above.');
  }
} finally {
  await browser.close();
}
