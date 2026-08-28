import { BotGuardClient, getChallenge } from 'bgutils-js/botguard';
import { WebPoMinter } from 'bgutils-js/webpo';
import { JSDOM } from 'jsdom';
import { parentPort } from 'node:worker_threads';
import { vtFetch } from 'server/common/vtFetch';
import { Innertube, UniversalCache } from 'youtubei.js';
import type { WorkerRequest, WorkerResponse } from './potoken.types';

/**
 * Mints PO tokens in a worker thread.
 *
 * **The thread is not an optimisation, it is a correctness requirement.** BotGuard's
 * interpreter needs DOM globals assigned onto `globalThis`, and in production
 * `server/src/main.ts` imports the compiled Nuxt server bundle into the same process — so
 * setting `globalThis.window`/`document` on the main thread would make every
 * `typeof window !== 'undefined'` check in Vue, Pinia and ofetch answer true during SSR.
 * That does not degrade server rendering, it breaks it.
 *
 * Running YouTube's obfuscated attestation program off the main thread also keeps it away
 * from this process's scope and gives the service a clean kill/restart on rotation.
 */

const BOTGUARD_REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo';
const GENERATE_IT_URL = 'https://jnn-pa.googleapis.com/$rpc/google.internal.waa.v1.Waa/GenerateIT';
const GOOG_API_KEY = 'AIzaSyDyT5W0Jh49F30Pqqtyfdf7pDLFKLJoAnw';

const post = (message: WorkerResponse) => parentPort?.postMessage(message);

/**
 * BotGuard reads `window`, `document` and `navigator` off the global scope, so jsdom has to
 * be installed before the interpreter is evaluated.
 *
 * jsdom logs a "Not implemented: HTMLCanvasElement.prototype.getContext" error during
 * attestation. It is expected — BotGuard fingerprints canvas and jsdom has no renderer —
 * and does not stop a token being minted.
 */
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

  // `navigator` is getter-only on globalThis, so plain assignment throws.
  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    configurable: true,
    writable: true
  });
};

/**
 * All YouTube-facing traffic for one playback — attestation, player request and segments —
 * has to leave from the same address. A token attested directly while playback goes out
 * through the configured proxy is bound to the wrong egress, which is a stronger bot signal
 * than sending no token at all, so this goes through `vtFetch` like everything else.
 */
const proxiedFetch = ((input: any, init?: any) =>
  vtFetch.rawFetch(input, { ...init, useProxy: true })) as unknown as typeof fetch;

let minter: WebPoMinter | null = null;

const attest = async () => {
  installDom();

  const challenge = await getChallenge({
    requestKey: BOTGUARD_REQUEST_KEY,
    fetchFunction: proxiedFetch,
    useYouTubeAPI: false
  });

  const interpreter =
    challenge.interpreterJavascript?.privateDoNotAccessOrElseSafeScriptWrappedValue;
  if (!interpreter) throw new Error('BotGuard challenge carried no interpreter');

  new Function(interpreter)();

  const botGuard = await BotGuardClient.create({
    program: challenge.program,
    globalName: challenge.globalName,
    globalObject: globalThis
  });

  const webPoSignalOutput: unknown[] = [];
  const botguardResponse = await botGuard.snapshot({ webPoSignalOutput } as any);

  const response = await proxiedFetch(GENERATE_IT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json+protobuf',
      'x-goog-api-key': GOOG_API_KEY,
      'x-user-agent': 'grpc-web-javascript/0.1'
    },
    body: JSON.stringify([BOTGUARD_REQUEST_KEY, botguardResponse])
  });

  const [integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken] =
    (await response.json()) as [string, number, number, string];

  if (!integrityToken) throw new Error('attestation returned no integrity token');

  minter = await WebPoMinter.create(
    { integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken },
    webPoSignalOutput as any
  );

  return { estimatedTtlSecs, mintRefreshThreshold };
};

/**
 * The session token must be bound to the same `visitorData` the real Innertube client will
 * use, so the worker generates the pair and hands both out rather than being told one.
 */
const init = async () => {
  const { estimatedTtlSecs, mintRefreshThreshold } = await attest();

  const seed = await Innertube.create({
    retrieve_player: false,
    enable_session_cache: false,
    cache: new UniversalCache(false),
    fetch: proxiedFetch
  });
  const visitorData = seed.session.context.client.visitorData;
  if (!visitorData) throw new Error('could not obtain visitor data');

  post({
    type: 'ready',
    poToken: await minter!.mintAsWebsafeString(visitorData),
    visitorData,
    ttlSecs: estimatedTtlSecs,
    mintRefreshThreshold
  });
};

parentPort?.on('message', async (message: WorkerRequest) => {
  try {
    if (message.type === 'init') {
      await init();
      return;
    }

    if (message.type === 'mint') {
      if (!minter) throw new Error('mint requested before attestation completed');
      post({
        type: 'minted',
        requestId: message.requestId,
        token: await minter.mintAsWebsafeString(message.binding)
      });
    }
  } catch (error) {
    post({
      type: 'error',
      requestId: message.type === 'mint' ? message.requestId : undefined,
      message: error instanceof Error ? error.message : String(error)
    });
  }
});
