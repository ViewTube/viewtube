/**
 * Phase 0 of POTOKEN_PLAN.md: does a validly minted PO token turn our 403 into a 200?
 *
 * Runs ONE BotGuard attestation, keeps the minter, and mints every token below from it —
 * which also demonstrates the plan's central claim that "a new token per video" costs a
 * local call, not a new attestation.
 *
 * Two independent axes are under test:
 *   - player: the token sent with the `player` request (getInfo -> SABR URL + ustreamerConfig)
 *   - gvs:    the token sent in the SABR request body (streamerContext.poToken)
 *
 * A bare HTTP 200 is not success: the first response is normally a SABR_REDIRECT, and a
 * 200 can still carry SABR_ERROR inside the UMP body. Both are followed and decoded.
 *
 * This measures the FIRST request only. YouTube's attestation gate does not close until
 * about a minute of media has been served, so a green run here does not mean the token is
 * irrelevant to playback — `sabr-download.mjs` is the probe for that.
 */
import vm from 'node:vm';

import {
  SabrError,
  SabrRedirect,
  StreamProtectionStatus,
  UMPPartId,
  VideoPlaybackAbrRequest
} from 'googlevideo/protos';
import { CompositeBuffer, UmpReader } from 'googlevideo/ump';
import { base64ToU8 } from 'googlevideo/utils';
import { Constants, Innertube, Platform, UniversalCache } from 'youtubei.js';
import { attest } from './botguard.mjs';

const args = process.argv.slice(2);
const argValue = name => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const videoId = argValue('--video') ?? 'dQw4w9WgXcQ';

const log = (...p) => console.log(...p);

// Mirrors server/src/common/innertube/innertube.ts — without this the `n` parameter stays
// scrambled and YouTube 403s regardless of any token.
Platform.shim.eval = async data =>
  vm.runInNewContext(`(function(){${data.output}})()`, Object.create(null), { timeout: 5000 });

//#region SABR request
const encodeRequest = ({ ustreamerConfig, clientInfo, format, poToken }) =>
  VideoPlaybackAbrRequest.encode({
    clientAbrState: { playerTimeMs: BigInt(0), enabledTrackTypesBitfield: 1 },
    selectedFormatIds: [
      {
        itag: format.itag,
        lastModified: BigInt(String(format.last_modified_ms ?? format.last_modified))
      }
    ],
    bufferedRanges: [],
    preferredAudioFormatIds: [],
    preferredVideoFormatIds: [],
    preferredSubtitleFormatIds: [],
    field1000: [],
    videoPlaybackUstreamerConfig: base64ToU8(ustreamerConfig),
    streamerContext: {
      poToken: poToken ? base64ToU8(poToken) : undefined,
      clientInfo,
      sabrContexts: [],
      unsentSabrContexts: [],
      field5: [],
      field6: []
    }
  }).finish();

const parseParts = bytes => {
  const parts = [];
  try {
    new UmpReader(new CompositeBuffer([bytes])).read(p => parts.push(p));
  } catch {
    /* partial body still yields the parts read so far */
  }
  return parts;
};

const describeUmp = bytes => {
  const parts = parseParts(bytes);
  if (!parts.length) return 'no UMP parts';

  const names = new Map(Object.entries(UMPPartId).map(([k, v]) => [v, k]));
  const counts = new Map();
  for (const p of parts) counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
  let out = [...counts.entries()].map(([t, c]) => `${names.get(t) ?? t}x${c}`).join(' ');

  const errorPart = parts.find(p => p.type === UMPPartId.SABR_ERROR);
  if (errorPart) {
    try {
      out += ` !! SABR_ERROR ${JSON.stringify(SabrError.decode(errorPart.data.getUint8Array(0, errorPart.size)))}`;
    } catch {
      out += ' !! SABR_ERROR (undecodable)';
    }
  }
  const protection = parts.find(p => p.type === UMPPartId.STREAM_PROTECTION_STATUS);
  if (protection) {
    try {
      const s = StreamProtectionStatus.decode(protection.data.getUint8Array(0, protection.size));
      out += ` [protection=${s.status}]`;
    } catch {
      /* ignore */
    }
  }

  const media = parts.filter(p => p.type === UMPPartId.MEDIA);
  if (media.length) out += ` [${media.reduce((n, p) => n + p.size, 0)}b media]`;
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

/** The first hop is normally a SABR_REDIRECT; not following it makes any status meaningless. */
const send = async (url, bytes) => {
  let { status, body } = await post(url, bytes);
  let hops = 0;
  while (hops < 3) {
    const part = parseParts(body).find(p => p.type === UMPPartId.SABR_REDIRECT);
    if (!part) break;
    let target;
    try {
      target = SabrRedirect.decode(part.data.getUint8Array(0, part.size)).url;
    } catch {
      break;
    }
    if (!target) break;
    ({ status, body } = await post(target, bytes));
    hops += 1;
  }
  const gotMedia = parseParts(body).some(p => p.type === UMPPartId.MEDIA);
  return {
    ok: status === 200 && gotMedia,
    text: `${String(status).padEnd(3)} ${String(body.length).padStart(7)}b  ${describeUmp(body)}${hops ? ` (+${hops} redirect)` : ''}`
  };
};
//#endregion

const runCase = async ({ label, playerToken, gvsToken, sessionToken, visitorData }) => {
  const client = await Innertube.create({
    cache: new UniversalCache(false),
    enable_session_cache: false,
    lang: 'en',
    visitor_data: visitorData,
    ...(sessionToken ? { po_token: sessionToken } : {})
  });

  const info = await client.getInfo(videoId, playerToken ? { po_token: playerToken } : undefined);

  const streamingData = info.streaming_data;
  const ustreamerConfig =
    info.player_config?.media_common_config?.media_ustreamer_request_config
      ?.video_playback_ustreamer_config;

  if (!streamingData?.server_abr_streaming_url || !ustreamerConfig) {
    return { label, text: 'no SABR endpoint in player response', cfg: 0, ok: false };
  }

  // Mirrors sabr.builder.ts: the ABR endpoint carries a scrambled `n` like any playback URL.
  let streamingUrl = streamingData.server_abr_streaming_url;
  try {
    streamingUrl = await client.session.player.decipher(streamingUrl);
  } catch (error) {
    log(`    (decipher failed: ${String(error?.message ?? error).slice(0, 60)})`);
  }

  const format =
    streamingData.adaptive_formats.find(f => f.mime_type?.startsWith('audio/mp4')) ??
    streamingData.adaptive_formats[0];

  const clientInfo = {
    clientName: Number(Constants.CLIENT_NAME_IDS[client.session.client_name]),
    clientVersion: client.session.client_version,
    osName: client.session.context.client.osName,
    osVersion: client.session.context.client.osVersion
  };

  const body = encodeRequest({ ustreamerConfig, clientInfo, format, poToken: gvsToken });
  const { ok, text } = await send(streamingUrl, body);
  return { label, text, cfg: base64ToU8(ustreamerConfig).length, ok };
};

const main = async () => {
  log(`\nPO token spike — video ${videoId}\n`);

  const seed = await Innertube.create({ retrieve_player: false, enable_session_cache: false });
  const visitorData = seed.session.context.client.visitorData;
  log(`visitorData: ${visitorData.slice(0, 28)}...`);

  const t0 = Date.now();
  const { minter, estimatedTtlSecs, mintRefreshThreshold } = await attest();
  log(
    `attestation:  ${Date.now() - t0}ms   ttl=${estimatedTtlSecs}s  refreshThreshold=${mintRefreshThreshold}`
  );

  const t1 = Date.now();
  const sessionToken = await minter.mintAsWebsafeString(visitorData);
  const contentToken = await minter.mintAsWebsafeString(videoId);
  log(
    `2 mints from the same minter: ${Date.now() - t1}ms  (session ${sessionToken.length}ch, content ${contentToken.length}ch)\n`
  );

  const cases = [
    { label: '1 no token anywhere' },
    { label: '2 player=content, gvs=none', playerToken: contentToken },
    { label: '3 player=none, gvs=content', gvsToken: contentToken },
    { label: '4 player=content, gvs=content', playerToken: contentToken, gvsToken: contentToken },
    {
      label: '5 session-bound only (Piped style)',
      sessionToken,
      playerToken: sessionToken,
      gvsToken: sessionToken
    }
  ];

  const results = [];
  for (const c of cases) {
    try {
      results.push(await runCase({ ...c, visitorData }));
    } catch (error) {
      results.push({
        label: c.label,
        text: `threw: ${String(error?.message ?? error).slice(0, 60)}`,
        cfg: 0,
        ok: false
      });
    }
  }

  const w = Math.max(...results.map(r => r.label.length));
  log('case'.padEnd(w) + '   cfg    result');
  log('-'.repeat(w + 60));
  for (const r of results) {
    log(`${r.label.padEnd(w)}   ${String(r.cfg).padStart(4)}b  ${r.text}`);
  }

  const winners = results.filter(r => r.ok);
  log(
    `\n=> ${winners.length ? `MEDIA RETURNED for: ${winners.map(r => r.label).join(', ')}` : 'no case returned media — the token is not the (only) gate'}\n`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
