/**
 * Independent control for "will YouTube serve this video past N seconds?".
 *
 * googlevideo's own node downloader (`SabrStream`) speaks the same protocol as the browser
 * adapter but shares none of its code — no Shaka, no request interceptor, no early stream
 * abort. If it also stops at the same point, the limit is YouTube's decision about the
 * session and not a defect in how ViewTube builds its requests.
 *
 * Reports how many seconds of media each track actually received.
 */
import { SabrStream } from 'googlevideo/sabr-stream';
import vm from 'node:vm';
import { Constants, Innertube, Platform, UniversalCache } from 'youtubei.js';
import { attest } from './botguard.mjs';

Platform.shim.eval = async data =>
  vm.runInNewContext(`(function(){${data.output}})()`, Object.create(null), { timeout: 5000 });

const args = process.argv.slice(2);
const argValue = name => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const videoId = argValue('--video') ?? 'dQw4w9WgXcQ';
const stopAfterMs = Number(argValue('--stop-after') ?? '120000');
// Which identifier the SABR-body token is bound to. The web player sends a session-bound
// token (tied to visitor_data); a content-bound one is what youtubei.js wants for the
// player request. They are not interchangeable, so they are separate axes here.
const useToken = args.includes('--token');
// A token captured from a real browser (see `capture-body --video <id>`), to test whether
// what YouTube's own player sends satisfies the gate that our minted tokens do not.
const literalToken = argValue('--po-token');
const bodyTokenMode = argValue('--token') ?? 'session';

let sessionToken;
let contentToken;
let visitorData;

if (useToken) {
  const seed = await Innertube.create({ retrieve_player: false, enable_session_cache: false });
  visitorData = seed.session.context.client.visitorData;
  const { minter } = await attest();
  sessionToken = await minter.mintAsWebsafeString(visitorData);
  contentToken = await minter.mintAsWebsafeString(videoId);
  console.log(`  minted session=${sessionToken.length}ch content=${contentToken.length}ch`);
}

const client = await Innertube.create({
  cache: new UniversalCache(false),
  enable_session_cache: false,
  lang: 'en',
  ...(useToken ? { visitor_data: visitorData, po_token: sessionToken } : {})
});
const info = await client.getBasicInfo(videoId, useToken ? { po_token: contentToken } : undefined);

const ustreamerConfig =
  info.player_config?.media_common_config?.media_ustreamer_request_config
    ?.video_playback_ustreamer_config;
if (!info.streaming_data?.server_abr_streaming_url || !ustreamerConfig) {
  console.log(`RESULT ${videoId} no SABR endpoint (${info.playability_status?.status})`);
  process.exit(0);
}

const streamingUrl = await client.session.player.decipher(
  info.streaming_data.server_abr_streaming_url
);

const stream = new SabrStream({
  serverAbrStreamingUrl: streamingUrl,
  videoPlaybackUstreamerConfig: ustreamerConfig,
  durationMs: (info.basic_info.duration ?? 0) * 1000,
  // youtubei.js formats are snake_case; googlevideo reads camelCase and silently sees an
  // empty ladder otherwise. Mirrors server/src/core/videos/sabr.builder.ts.
  formats: info.streaming_data.adaptive_formats.map(f => ({
    itag: f.itag,
    lastModified: String(f.last_modified_ms ?? f.last_modified ?? ''),
    bitrate: f.bitrate,
    approxDurationMs: Number(f.approx_duration_ms ?? 0),
    xtags: f.xtags,
    width: f.width,
    height: f.height,
    contentLength: f.content_length ? Number(f.content_length) : undefined,
    audioTrackId: f.audio_track?.id,
    mimeType: f.mime_type,
    isDrc: f.is_drc,
    qualityLabel: f.quality_label,
    audioQuality: f.audio_quality,
    language: f.language ?? undefined
  })),
  poToken: literalToken ?? (bodyTokenMode === 'content' ? contentToken : sessionToken),
  clientInfo: {
    clientName: Number(Constants.CLIENT_NAME_IDS[client.session.client_name]),
    clientVersion: client.session.client_version,
    osName: client.session.context.client.osName,
    osVersion: client.session.context.client.osVersion
  }
});

const seenMs = { video: 0, audio: 0 };
stream.on('formatInitialization', f =>
  console.log(`  init ${f.formatInitializationMetadata?.formatId?.itag}`)
);
stream.on('reloadPlayerResponse', () => console.log('  server asked for a player reload'));
// 1 = no attestation needed, 2 = grace period (a token will be demanded), 3 = rejected.
// This is the field that separates a video that plays to the end from one that stops
// around 60s, and it says so from the very first response.
stream.on('streamProtectionStatusUpdate', s => console.log(`  protection status=${s.status}`));

const drain = async readable => {
  const reader = readable.getReader();
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
  }
  return bytes;
};

const timer = setTimeout(() => {
  console.log('  stopping (time limit)');
  stream.abort();
}, stopAfterMs);

try {
  // Explicit selectors rather than quality strings: the quality matcher rejects ladders
  // that carry no matching label and the resulting "no suitable formats" says nothing
  // about the question being asked.
  const { videoStream, audioStream, selectedFormats } = await stream.start({
    videoFormat: formats => formats.filter(f => f.width).sort((a, b) => b.width - a.width)[0],
    audioFormat: formats => formats.filter(f => !f.width)[0]
  });
  console.log(
    `  formats: video=${selectedFormats.videoFormat.itag} audio=${selectedFormats.audioFormat.itag}`
  );

  // Progress is read off the stream's own state rather than the byte counts: a byte total
  // says nothing about how far into the timeline the server got.
  const poll = setInterval(() => {
    try {
      const state = stream.getState();
      for (const f of state.initializedFormats) {
        const last = f.lastMediaHeaders?.[f.lastMediaHeaders.length - 1];
        if (!last) continue;
        const endMs = Number(last.startMs ?? 0) + Number(last.durationMs ?? 0);
        const kind = f.formatInitializationMetadata?.formatId?.itag > 300 ? 'video' : 'audio';
        seenMs[kind] = Math.max(seenMs[kind], endMs);
      }
    } catch {
      // getState throws until the main format is initialized.
    }
  }, 500);

  const [videoBytes, audioBytes] = await Promise.all([
    drain(videoStream),
    drain(audioStream)
  ]);
  clearInterval(poll);
  console.log(
    `RESULT ${videoId} video=${(seenMs.video / 1000).toFixed(1)}s/${videoBytes}B audio=${(seenMs.audio / 1000).toFixed(1)}s/${audioBytes}B duration=${info.basic_info.duration}s`
  );
} catch (error) {
  console.log(
    `RESULT ${videoId} threw after video=${(seenMs.video / 1000).toFixed(1)}s audio=${(seenMs.audio / 1000).toFixed(1)}s: ${String(error?.message ?? error).slice(0, 120)}`
  );
} finally {
  clearTimeout(timer);
}
process.exit(0);
