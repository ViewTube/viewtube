import { Innertube, UniversalCache } from 'youtubei.js';
import path from 'path';

let cacheDirectory = './cache';
if (process.env.VIEWTUBE_DATA_DIRECTORY) {
  cacheDirectory = path.join(process.env.VIEWTUBE_DATA_DIRECTORY, 'cache');
}

export const innertubeClient = Innertube.create({
  cache: new UniversalCache(true, cacheDirectory)
});
