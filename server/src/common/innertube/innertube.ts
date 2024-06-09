import path from 'path';
import { Innertube, InnertubeConfig, UniversalCache } from 'youtubei.js';
import { innertubeFetch } from './innertubeFetch';

let cacheDirectory = './cache';
if (process.env.VIEWTUBE_DATA_DIRECTORY) {
  cacheDirectory = path.join(process.env.VIEWTUBE_DATA_DIRECTORY, 'cache');
}

const innertubeOptions: InnertubeConfig = {
  cache: new UniversalCache(true, cacheDirectory),
  fetch: innertubeFetch
};

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
