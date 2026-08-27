/**
 * Does a PO token clear "Sign in to confirm you're not a bot"?
 *
 * `potoken-spike` answered the *SABR body* question and found the token is not a gate
 * there. This asks the other question: the `player` request itself. When YouTube decides
 * an IP is a bot it answers `getInfo` with `LOGIN_REQUIRED` and no streaming data at all,
 * so there is nothing for SABR to play — the gate is upstream of everything the SABR
 * probes measure.
 *
 * Prints playability status per video for each token strategy. `OK` with a SABR URL is a
 * pass; `LOGIN_REQUIRED` is the gate still closed.
 */
import vm from 'node:vm';
import { Innertube, Platform, UniversalCache } from 'youtubei.js';
import { attest } from './botguard.mjs';

Platform.shim.eval = async data =>
  vm.runInNewContext(`(function(){${data.output}})()`, Object.create(null), { timeout: 5000 });

const args = process.argv.slice(2);
const argValue = name => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const videoIds = (argValue('--videos') ?? 'dQw4w9WgXcQ,is8UDe2PhKQ,Nz9b0oJw69I').split(',');

const describe = async (client, id, playerToken) => {
  try {
    const info = await client.getInfo(id, playerToken ? { po_token: playerToken } : undefined);
    const status = info.playability_status?.status;
    return `${status}${status === 'OK' ? '' : ` (${info.playability_status?.reason})`} sabr=${!!info.streaming_data?.server_abr_streaming_url} formats=${info.streaming_data?.adaptive_formats?.length ?? 0}`;
  } catch (error) {
    return `threw: ${String(error?.message ?? error).slice(0, 70)}`;
  }
};

const seed = await Innertube.create({ retrieve_player: false, enable_session_cache: false });
const visitorData = seed.session.context.client.visitorData;
console.log(`visitorData: ${visitorData.slice(0, 28)}...`);

const t0 = Date.now();
const { minter, estimatedTtlSecs } = await attest();
console.log(`attestation: ${Date.now() - t0}ms  ttl=${estimatedTtlSecs}s`);

const sessionToken = await minter.mintAsWebsafeString(visitorData);
console.log(`session token: ${sessionToken.length}ch\n`);

const cases = [
  { label: 'no token', config: { enable_session_cache: false, lang: 'en' } },
  {
    label: 'session-bound (visitor_data + po_token)',
    config: {
      enable_session_cache: false,
      lang: 'en',
      visitor_data: visitorData,
      po_token: sessionToken
    }
  },
  {
    label: 'session-bound + per-video content token',
    config: {
      enable_session_cache: false,
      lang: 'en',
      visitor_data: visitorData,
      po_token: sessionToken
    },
    perVideo: true
  }
];

for (const { label, config, perVideo } of cases) {
  console.log(label);
  const client = await Innertube.create({ cache: new UniversalCache(false), ...config });
  for (const id of videoIds) {
    const playerToken = perVideo ? await minter.mintAsWebsafeString(id) : undefined;
    console.log(`  ${id}  ${await describe(client, id, playerToken)}`);
  }
  console.log();
}
