/**
 * Sends one real SABR segment request per po_token strategy and reports the HTTP status.
 * See README.md for how to read the results.
 */
import { BotGuardClient, getChallenge } from 'bgutils-js/botguard';
import { createColdStartToken, WebPoMinter } from 'bgutils-js/webpo';
import { VideoPlaybackAbrRequest } from 'googlevideo/protos';
import { base64ToU8 } from 'googlevideo/utils';
import { JSDOM } from 'jsdom';
import { Constants, Innertube, UniversalCache } from 'youtubei.js';

const BOTGUARD_REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo';
const GENERATE_IT_URL = 'https://jnn-pa.googleapis.com/$rpc/google.internal.waa.v1.Waa/GenerateIT';
const GOOG_API_KEY = 'AIzaSyDyT5W0Jh49F30Pqqtyfdf7pDLFKLJoAnw';

const args = process.argv.slice(2);
const argValue = name => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const videoId = argValue('--video') ?? 'dQw4w9WgXcQ';
const proxyApi = argValue('--proxy');

const log = (...parts) => console.log(...parts);

/** BotGuard runs browser code; jsdom is the smallest thing that satisfies it. */
const installDom = () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://www.youtube.com/',
    referrer: 'https://www.youtube.com/'
  });
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    location: dom.window.location,
    origin: dom.window.origin
  });
  // navigator is getter-only on globalThis, so plain assignment throws.
  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    configurable: true,
    writable: true
  });
};

const mintPoToken = async visitorData => {
  installDom();

  const challenge = await getChallenge({
    requestKey: BOTGUARD_REQUEST_KEY,
    fetchFunction: fetch,
    useYouTubeAPI: false
  });

  const interpreter =
    challenge.interpreterJavascript?.privateDoNotAccessOrElseSafeScriptWrappedValue;
  if (!interpreter) throw new Error('challenge carried no interpreter');
  new Function(interpreter)();

  const botGuard = await BotGuardClient.create({
    program: challenge.program,
    globalName: challenge.globalName,
    globalObject: globalThis
  });

  const webPoSignalOutput = [];
  const botguardResponse = await botGuard.snapshot({ webPoSignalOutput });

  const response = await fetch(GENERATE_IT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json+protobuf',
      'x-goog-api-key': GOOG_API_KEY,
      'x-user-agent': 'grpc-web-javascript/0.1'
    },
    body: JSON.stringify([BOTGUARD_REQUEST_KEY, botguardResponse])
  });

  const [integrityToken, estimatedTtlSecs] = await response.json();
  if (!integrityToken) throw new Error('no integrity token returned');

  const minter = await WebPoMinter.create({ integrityToken }, webPoSignalOutput);
  return { poToken: await minter.mintAsWebsafeString(visitorData), estimatedTtlSecs };
};

/**
 * Every repeated field has to be present — these generated protos iterate them
 * unconditionally and throw on undefined.
 */
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

/** Mirrors what the client composable does: swap the host for the proxy, keep the query. */
const toProxyUrl = streamingUrl => {
  const url = new URL(streamingUrl);
  const params = new URLSearchParams(url.searchParams);
  params.set('__host', url.host);
  return `${proxyApi.replace(/\/$/, '')}/videoplayback?${params.toString()}`;
};

const send = async (url, body) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/x-protobuf' },
      body
    });
    const bytes = new Uint8Array(await response.arrayBuffer()).length;
    return `${response.status} (${bytes} bytes)`;
  } catch (error) {
    return `threw: ${String(error?.message ?? error).slice(0, 40)}`;
  }
};

const runCase = async (label, sessionOptions, poTokenFor) => {
  const client = await Innertube.create({
    cache: new UniversalCache(false),
    enable_session_cache: false,
    lang: 'en',
    ...sessionOptions
  });

  const info = await client.getInfo(videoId);
  const streamingData = info.streaming_data;
  const ustreamerConfig =
    info.player_config?.media_common_config?.media_ustreamer_request_config
      ?.video_playback_ustreamer_config;

  if (!streamingData?.server_abr_streaming_url || !ustreamerConfig) {
    return { label, direct: 'no SABR endpoint in player response', proxied: null };
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

  const poToken = await poTokenFor(client);
  const body = encodeRequest({ ustreamerConfig, clientInfo, format, poToken });

  const direct = await send(streamingData.server_abr_streaming_url, body);
  const proxied = proxyApi
    ? await send(toProxyUrl(streamingData.server_abr_streaming_url), body)
    : null;

  return { label, direct, proxied, formats: streamingData.adaptive_formats.length };
};

const main = async () => {
  log(`\nSABR probe — video ${videoId}${proxyApi ? ` (also via proxy ${proxyApi})` : ''}\n`);

  const seed = await Innertube.create({ retrieve_player: false });
  const visitorData = seed.session.context.client.visitorData;

  let minted;
  try {
    minted = await mintPoToken(visitorData);
    log(`minted a BotGuard po_token (ttl ${minted.estimatedTtlSecs}s)\n`);
  } catch (error) {
    log(`could not mint a po_token: ${String(error?.message ?? error).slice(0, 70)}\n`);
  }

  const cases = [
    ['none', {}, () => undefined],
    ['cold-start', { visitor_data: visitorData }, () => createColdStartToken(visitorData)]
  ];

  if (minted) {
    cases.push([
      'minted',
      { po_token: minted.poToken, visitor_data: visitorData },
      () => minted.poToken
    ]);
  }

  // Whatever the deployment is actually configured with, if anything.
  if (process.env.VIEWTUBE_PO_TOKEN) {
    cases.push([
      'env VIEWTUBE_PO_TOKEN',
      { po_token: process.env.VIEWTUBE_PO_TOKEN, visitor_data: process.env.VIEWTUBE_VISITOR_DATA },
      () => process.env.VIEWTUBE_PO_TOKEN
    ]);
  }

  const results = [];
  for (const [label, sessionOptions, poTokenFor] of cases) {
    try {
      results.push(await runCase(label, sessionOptions, poTokenFor));
    } catch (error) {
      results.push({
        label,
        direct: `failed: ${String(error?.message ?? error).slice(0, 45)}`,
        proxied: null
      });
    }
  }

  const width = Math.max(...results.map(r => r.label.length));
  log('po_token'.padEnd(width) + '   direct                  ' + (proxyApi ? 'via proxy' : ''));
  log('-'.repeat(width + (proxyApi ? 48 : 26)));
  for (const result of results) {
    log(
      result.label.padEnd(width) +
        '   ' +
        String(result.direct).padEnd(24) +
        (result.proxied ? String(result.proxied) : '')
    );
  }

  const anyOk = results.some(r => String(r.direct).startsWith('200'));
  log(
    anyOk
      ? '\nSABR is reachable from this network. See README for which phase to start.'
      : '\nEvery strategy was refused — same as the 2026-08-27 baseline. Do not start the client adapter.'
  );
};

main().catch(error => {
  console.error('probe failed:', error);
  process.exit(1);
});
