/**
 * Which innertube client still gets a playable SABR player response?
 *
 * YouTube answers `getInfo` for some videos with `LOGIN_REQUIRED` / "Sign in to confirm
 * you're not a bot" while others are fine, and a PO token does not lift it (see
 * `login-gate.mjs`). The remaining axis is the client the request claims to be.
 *
 * A pass needs three things, not just `OK`: a playability status of OK, a
 * `server_abr_streaming_url`, and the ustreamer config that every SABR request body has to
 * carry. A client that returns OK but no ustreamer config is no use to us.
 */
import vm from 'node:vm';
import { Innertube, Platform, UniversalCache } from 'youtubei.js';

Platform.shim.eval = async data =>
  vm.runInNewContext(`(function(){${data.output}})()`, Object.create(null), { timeout: 5000 });

const args = process.argv.slice(2);
const argValue = name => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const videoIds = (argValue('--videos') ?? 'dQw4w9WgXcQ,is8UDe2PhKQ,Nz9b0oJw69I').split(',');
const clients = (
  argValue('--clients') ??
  'WEB,MWEB,TV,TV_SIMPLY,TV_EMBEDDED,WEB_EMBEDDED,IOS,ANDROID,ANDROID_VR,VISIONOS,WEB_CREATOR'
).split(',');

const rows = [];

for (const clientType of clients) {
  for (const id of videoIds) {
    // A fresh session per probe: reusing one Innertube across getInfo calls has produced
    // false positives here before (see SABR_PLAN.md, Livestreams).
    let text;
    try {
      const client = await Innertube.create({
        cache: new UniversalCache(false),
        enable_session_cache: false,
        lang: 'en',
        client_type: clientType
      });
      // getBasicInfo hits /player only; /next parses badly on non-WEB clients and its
      // failure says nothing about whether the stream is reachable.
      const info = await client.getBasicInfo(id);
      const status = info.playability_status?.status;
      const sabrUrl = !!info.streaming_data?.server_abr_streaming_url;
      const ustreamer =
        !!info.player_config?.media_common_config?.media_ustreamer_request_config
          ?.video_playback_ustreamer_config;
      const pass = status === 'OK' && sabrUrl && ustreamer;
      text =
        `${pass ? 'PASS' : 'fail'}  ${status}` +
        `${status === 'OK' ? '' : ` (${info.playability_status?.reason})`}` +
        `  sabr=${sabrUrl} ustreamer=${ustreamer}` +
        ` formats=${info.streaming_data?.adaptive_formats?.length ?? 0}`;
    } catch (error) {
      text = `fail  threw: ${String(error?.message ?? error).slice(0, 160)}`;
    }
    rows.push([clientType, id, text]);
  }
}

const w = Math.max(...rows.map(r => r[0].length));
for (const [clientType, id, text] of rows) {
  console.log(`RESULT ${clientType.padEnd(w)}  ${id}  ${text}`);
}
