import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { innertubeClient } from 'server/common/innertube/innertube';
import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import {
  CATEGORY_CACHE_PREFIX,
  DAY_MS,
  MAX_HOME_FEED_VIDEOS,
  MIN_ACCEPTABLE_VIDEOS,
  MIN_CATEGORY_VIDEOS,
  SOURCE_TIMEOUT_MS
} from './category-feed.constants';
import { CategoryDefinition } from './category-feed.types';
import { categoryDefinitions } from './category-sources';

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`Timed out after ${timeoutMs}ms`)),
      timeoutMs
    );
    promise
      .then(value => resolve(value))
      .catch(error => reject(error))
      .finally(() => clearTimeout(timeout));
  });
};

const deduplicateById = (videos: Array<VTVideoDto>): Array<VTVideoDto> => {
  const seenIds = new Set<string>();
  return videos.filter(video => {
    if (!video?.id || !video?.title || seenIds.has(video.id)) return false;
    seenIds.add(video.id);
    return true;
  });
};

@Injectable()
export class CategoryFeedService {
  private readonly logger = new Logger(CategoryFeedService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getMixedFeed(): Promise<{ videos: Array<VTVideoDto>; degraded: boolean }> {
    const results = await Promise.allSettled(
      categoryDefinitions.map(definition => this.getCategoryVideos(definition))
    );

    const buckets = results
      .map((result, index) => {
        if (result.status === 'rejected') {
          this.logger.warn(
            `Category ${categoryDefinitions[index].category} failed: ${result.reason?.message}`
          );
          return [];
        }
        return result.value;
      })
      .filter(bucket => bucket.length);

    const videos = this.mixCategories(buckets);

    return { videos, degraded: videos.length < MIN_ACCEPTABLE_VIDEOS };
  }

  async getCategoryVideos(definition: CategoryDefinition): Promise<Array<VTVideoDto>> {
    const cacheKey = CATEGORY_CACHE_PREFIX + definition.category;
    const cachedVideos = await this.cacheManager.get<Array<VTVideoDto>>(cacheKey);
    if (cachedVideos?.length) return cachedVideos;

    const videos = await this.fetchCategoryVideos(definition);

    if (videos.length) {
      await this.cacheManager.set(cacheKey, videos, DAY_MS);
    }

    return videos;
  }

  private async fetchCategoryVideos(definition: CategoryDefinition): Promise<Array<VTVideoDto>> {
    const client = await innertubeClient();
    let videos: Array<VTVideoDto> = [];

    for (const source of definition.sources) {
      try {
        const sourceVideos = await withTimeout(source.fetch(client), SOURCE_TIMEOUT_MS);
        videos = deduplicateById(videos.concat(sourceVideos));
      } catch (error) {
        this.logger.warn(
          `Home feed source ${source.id} (${definition.category}) failed: ${error?.message}`
        );
      }

      if (videos.length >= MIN_CATEGORY_VIDEOS) break;
    }

    return videos;
  }

  /**
   * Take one video from each category in turn, so no single category owns the top of the grid.
   * The starting category rotates daily, which keeps the mix stable within a cache day.
   */
  private mixCategories(buckets: Array<Array<VTVideoDto>>): Array<VTVideoDto> {
    if (!buckets.length) return [];

    const dayOffset = Math.floor(Date.now() / DAY_MS) % buckets.length;
    const rotatedBuckets = buckets.slice(dayOffset).concat(buckets.slice(0, dayOffset));
    const longestBucket = Math.max(...rotatedBuckets.map(bucket => bucket.length));
    const mixedVideos: Array<VTVideoDto> = [];

    for (let index = 0; index < longestBucket; index++) {
      for (const bucket of rotatedBuckets) {
        if (bucket[index]) mixedVideos.push(bucket[index]);
      }
    }

    return deduplicateById(mixedVideos).slice(0, MAX_HOME_FEED_VIDEOS);
  }
}
