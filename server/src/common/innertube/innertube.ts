import path from 'path';
import { Innertube, Log, UniversalCache } from 'youtubei.js';
import type { InnerTubeConfig } from 'youtubei.js/dist/src/types';
import { innertubeFetch } from './innertubeFetch';

Log.setLevel(Log.Level.ERROR);

let cacheDirectory = './cache';
if (process.env.VIEWTUBE_DATA_DIRECTORY) {
  cacheDirectory = path.join(process.env.VIEWTUBE_DATA_DIRECTORY, 'cache');
}

const innertubeOptions: InnerTubeConfig = {
  cache: new UniversalCache(true, cacheDirectory),
  fetch: innertubeFetch,
  enable_session_cache: false,
  po_token: 'MnT2oOZls03H7faYrUDz5445MMN0Lofx_qyQ6gmd05cTQnpv9Yw3oiJDQ2dmbr4oVC4S6s3-hT8FoHcePU4CTWmWEW3Ndw82ALLyfklkPI4_W6LTLD2t8uMApgldWjqnECzMjUs9WrpZwKgP0YTrb53T63walQ==',
  visitor_data: 'CgtNR0pqRHVDYVI2Zyjk8pq5BjIKCgJDSBIEGgAgUw%3D%3D',
  lang: 'en'
};

if (process.env.VIEWTUBE_LOCATION) {
  innertubeOptions.location = process.env.VIEWTUBE_LOCATION;
}

if (process.env.VIEWTUBE_YOUTUBE_COOKIE) {
  innertubeOptions.cookie = process.env.VIEWTUBE_YOUTUBE_COOKIE;
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
