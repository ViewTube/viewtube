/**
 * If YouTube cuts a video off partway, does starting a *fresh session* let it continue?
 *
 * This is the question that decides whether the wall is worth handling in the player.
 * ViewTube already has the machinery — `sabrAdapter`'s `reloadSession` re-fetches
 * `/api/videos/:id` for a new streaming URL, ustreamer config and PO token — but it only
 * runs when YouTube asks for a reload, never when the stream simply stops producing media.
 * If a new session resumes from the cut-off point, wiring the wall to that same path is a
 * real fix. If it stops at the same place, the position is a property of the video and no
 * amount of re-tokenising helps.
 *
 * Phase 1 downloads until the stream dies and captures its state. Phase 2 builds a
 * completely new session — new Innertube, new player request, newly minted token — and
 * resumes from that state.
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
const videoId = argValue('--video') ?? 'is8UDe2PhKQ';
const useToken = args.includes('--token');

let minter;
if (useToken) ({ minter } = await attest());

/** A complete, independent session: its own client, player response and token. */
const newSession = async label => {
  let visitorData;
  let sessionToken;
  let contentToken;

  if (minter) {
    const seed = await Innertube.create({ retrieve_player: false, enable_session_cache: false });
    visitorData = seed.session.context.client.visitorData;
    sessionToken = await minter.mintAsWebsafeString(visitorData);
    contentToken = await minter.mintAsWebsafeString(videoId);
  }

  const client = await Innertube.create({
    cache: new UniversalCache(false),
    enable_session_cache: false,
    lang: 'en',
    ...(minter ? { visitor_data: visitorData, po_token: sessionToken } : {})
  });

  const info = await client.getBasicInfo(
    videoId,
    contentToken ? { po_token: contentToken } : undefined
  );

  const ustreamerConfig =
    info.player_config?.media_common_config?.media_ustreamer_request_config
      ?.video_playback_ustreamer_config;

  if (!info.streaming_data?.server_abr_streaming_url || !ustreamerConfig) {
    throw new Error(`${label}: no SABR endpoint (${info.playability_status?.status})`);
  }

  const streamingUrl = await client.session.player.decipher(
    info.streaming_data.server_abr_streaming_url
  );

  const stream = new SabrStream({
    serverAbrStreamingUrl: streamingUrl,
    videoPlaybackUstreamerConfig: ustreamerConfig,
    durationMs: (info.basic_info.duration ?? 0) * 1000,
    poToken: contentToken,
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
    clientInfo: {
      clientName: Number(Constants.CLIENT_NAME_IDS[client.session.client_name]),
      clientVersion: client.session.client_version,
      osName: client.session.context.client.osName,
      osVersion: client.session.context.client.osVersion
    }
  });

  console.log(
    `${label}: session ready (streamingUrl ...${streamingUrl.slice(-24)}, token ${
      contentToken ? `${contentToken.length}ch` : 'none'
    })`
  );
  return { stream, durationSecs: info.basic_info.duration ?? 0 };
};

/** Runs a stream to completion or failure and reports how far into the timeline it got. */
const run = async (stream, label, state) => {
  const reached = { video: 0, audio: 0 };
  let lastStatus = null;

  stream.on('streamProtectionStatusUpdate', s => {
    if (s.status !== lastStatus) {
      console.log(`${label}: protection status ${s.status}`);
      lastStatus = s.status;
    }
  });

  const track = () => {
    try {
      for (const f of stream.getState().initializedFormats) {
        const last = f.lastMediaHeaders?.[f.lastMediaHeaders.length - 1];
        if (!last) continue;
        const kind = f.formatInitializationMetadata?.formatId?.itag > 300 ? 'video' : 'audio';
        reached[kind] = Math.max(
          reached[kind],
          Number(last.startMs ?? 0) + Number(last.durationMs ?? 0)
        );
      }
    } catch {
      // getState throws until the main format initializes.
    }
  };
  const poll = setInterval(track, 400);

  // Byte counts, not just timeline position: a resumed session starts with the previous
  // session's `lastMediaHeaders` restored, so "reached 63.6s" alone cannot distinguish
  // "fetched more and stopped there" from "fetched nothing at all".
  let bytes = 0;
  const drain = async readable => {
    const reader = readable.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.length;
    }
  };

  let capturedState = null;
  let error = null;
  try {
    const { videoStream, audioStream } = await stream.start({
      videoFormat: formats => formats.filter(f => f.width).sort((a, b) => b.width - a.width)[0],
      audioFormat: formats => formats.filter(f => !f.width)[0],
      ...(state ? { state } : {})
    });
    await Promise.all([drain(videoStream), drain(audioStream)]);
  } catch (e) {
    error = String(e?.message ?? e);
  } finally {
    track();
    try {
      capturedState = stream.getState();
    } catch {
      // Nothing initialized; there is no state worth carrying over.
    }
    clearInterval(poll);
  }

  console.log(
    `${label}: video reached ${(reached.video / 1000).toFixed(1)}s, audio ${(
      reached.audio / 1000
    ).toFixed(1)}s, ${bytes} bytes received${error ? ` — ${error}` : ' — finished'}`
  );
  return { reached, capturedState, bytes };
};

console.log(`\nresume probe — ${videoId}${useToken ? ' (with freshly minted tokens)' : ''}\n`);

const first = await newSession('session 1');
const firstRun = await run(first.stream, 'session 1');

if (firstRun.reached.video === 0) {
  console.log('\nsession 1 got no media at all; nothing to resume from.');
  process.exit(0);
}

console.log('\n--- building a completely new session and resuming from that point ---\n');

const second = await newSession('session 2');
const secondRun = await run(second.stream, 'session 2', firstRun.capturedState);

const before = firstRun.reached.video / 1000;
const after = secondRun.reached.video / 1000;
console.log(
  `\nVERDICT: session 1 stopped at ${before.toFixed(1)}s; a fresh session resumed to ${after.toFixed(
    1
  )}s of ${first.durationSecs}s — ${
    after > before + 1
      ? 'IT CONTINUES past the wall'
      : `it stops at the same place (${secondRun.bytes} bytes received)`
  }`
);
process.exit(0);
