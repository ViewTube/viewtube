import path from 'path';
import { InnertubeConfig } from 'youtubei.js';
import { Innertube, UniversalCache } from 'youtubei.js';
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

export const innertubeClient = async () => {
  if (!innerTubeClient) {
    innerTubeClient = await Innertube.create(innertubeOptions);
  }
  return innerTubeClient;
};
