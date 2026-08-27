import vm from 'node:vm';
import path from 'path';
import type { Types } from 'youtubei.js';
import { Innertube, Log, Platform, UniversalCache } from 'youtubei.js';
import { innertubeFetch } from './innertubeFetch';

Log.setLevel(Log.Level.ERROR);

/**
 * Deciphering playback URLs means running YouTube's obfuscated player JS, and youtubei.js
 * ships no interpreter — without this every deciphered URL keeps its scrambled `n`
 * parameter and YouTube answers playback requests with 403.
 *
 * The docs suggest `new Function`; `vm.runInNewContext` is used instead so the script
 * cannot reach this module's scope. It is still YouTube's code running in-process, which
 * is inherent to deciphering, so it is kept on a short timeout.
 *
 * `data.output` is a function *body* and ends in a `return`, which is a syntax error at
 * the top level of a script — hence the IIFE wrapper. Without it every call throws
 * "Illegal return statement" and callers that treat deciphering as best-effort silently
 * fall back to scrambled URLs.
 */
Platform.shim.eval = async (data: Types.BuildScriptResult) =>
  vm.runInNewContext(`(function(){${data.output}})()`, Object.create(null), { timeout: 5000 });

let cacheDirectory = './cache';
if (process.env.VIEWTUBE_DATA_DIRECTORY) {
  cacheDirectory = path.join(process.env.VIEWTUBE_DATA_DIRECTORY, 'cache');
}

const innertubeOptions: Types.InnerTubeConfig = {
  cache: new UniversalCache(true, cacheDirectory),
  fetch: innertubeFetch as unknown as typeof fetch,
  enable_session_cache: false,
  lang: 'en'
};

if (process.env.VIEWTUBE_LOCATION) {
  innertubeOptions.location = process.env.VIEWTUBE_LOCATION;
}

if (process.env.VIEWTUBE_YOUTUBE_COOKIE) {
  innertubeOptions.cookie = process.env.VIEWTUBE_YOUTUBE_COOKIE;
}

if (process.env.VIEWTUBE_PO_TOKEN) {
  innertubeOptions.po_token = process.env.VIEWTUBE_PO_TOKEN;
}

if (process.env.VIEWTUBE_VISITOR_DATA) {
  innertubeOptions.visitor_data = process.env.VIEWTUBE_VISITOR_DATA;
}

let innerTubeClient: Innertube | null = null;
let clientCreatedAt: number | null = null;

export const innertubeClient = async () => {
  const clientOutdated = clientCreatedAt ? Date.now() - clientCreatedAt > 600000 : true;
  if (!innerTubeClient || clientOutdated) {
    innerTubeClient = await Innertube.create(innertubeOptions);
    clientCreatedAt = Date.now();
  }
  return innerTubeClient;
};
