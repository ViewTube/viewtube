/**
 * One BotGuard attestation, shared by the probes that need a PO token.
 *
 * Attestation is the expensive part (~200ms and a round trip to Google); minting tokens
 * from the returned minter is local and ~1ms, so a probe should attest once and mint per
 * video/session from the result.
 */
import { BotGuardClient, getChallenge } from 'bgutils-js/botguard';
import { WebPoMinter } from 'bgutils-js/webpo';
import { JSDOM } from 'jsdom';

const BOTGUARD_REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo';
const GENERATE_IT_URL = 'https://jnn-pa.googleapis.com/$rpc/google.internal.waa.v1.Waa/GenerateIT';
const GOOG_API_KEY = 'AIzaSyDyT5W0Jh49F30Pqqtyfdf7pDLFKLJoAnw';

/** BotGuard's program reads `window`/`document`/`navigator`; node has none. */
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

export const attest = async () => {
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

  const [integrityToken, estimatedTtlSecs, mintRefreshThreshold] = await response.json();
  if (!integrityToken) throw new Error('no integrity token returned');

  const minter = await WebPoMinter.create(
    { integrityToken, estimatedTtlSecs, mintRefreshThreshold },
    webPoSignalOutput
  );
  return { minter, estimatedTtlSecs, mintRefreshThreshold };
};
