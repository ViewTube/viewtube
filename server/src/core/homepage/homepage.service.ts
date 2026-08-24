import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { FastifyReply } from 'fastify';
import { innertubeClient } from 'server/common/innertube/innertube';
import { ViewTubeRequest } from 'server/common/viewtube-request';
import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import { HistoryService } from 'server/user/history/history.service';
import { toHomeFeed } from '../../mapper/converter/homefeed/homefeed.converter';
import {
  COOLDOWN_TTL_MS,
  DAY_MS,
  DEGRADED_TTL_MS,
  HOME_FEED_CACHE_KEY,
  HOME_FEED_COOLDOWN_KEY,
  MAX_HOME_FEED_VIDEOS,
  MIN_REAL_HOME_FEED_VIDEOS
} from './category-feed/category-feed.constants';
import { CategoryFeedService } from './category-feed/category-feed.service';
import { HomeFeedDto } from './dto/home-feed.dto';

@Injectable()
export class HomepageService {
  private readonly logger = new Logger(HomepageService.name);

  constructor(
    private historyService: HistoryService,
    private categoryFeedService: CategoryFeedService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getHomeFeed(request: ViewTubeRequest, reply: FastifyReply): Promise<HomeFeedDto> {
    const username = request?.user?.username;
    let videos = await this.cacheManager.get<Array<VTVideoDto>>(HOME_FEED_CACHE_KEY);

    if (!videos?.length) {
      videos = await this.buildAndCacheHomeFeed();
    }

    if (username) {
      reply.header('Cache-Control', 'private, no-store');

      if (videos.length) {
        return {
          videos: await this.historyService.enhanceVideoListWithHistory(username, videos)
        };
      }
    } else {
      reply.header(
        'Cache-Control',
        videos.length ? `public, max-age=${DAY_MS / 1000}` : 'no-store'
      );
    }

    return { videos };
  }

  private async buildAndCacheHomeFeed(): Promise<Array<VTVideoDto>> {
    // Youtube can fail on all sources at once, don't hammer it on every request while it does
    const coolingDown = await this.cacheManager.get(HOME_FEED_COOLDOWN_KEY);
    if (coolingDown) return [];

    const { videos, degraded } = await this.buildHomeFeed();

    if (videos.length) {
      await this.cacheManager.set(HOME_FEED_CACHE_KEY, videos, degraded ? DEGRADED_TTL_MS : DAY_MS);
    } else {
      await this.cacheManager.set(HOME_FEED_COOLDOWN_KEY, true, COOLDOWN_TTL_MS);
      this.logger.warn('Home feed is empty, all sources failed');
    }

    return videos;
  }

  private async buildHomeFeed(): Promise<{ videos: Array<VTVideoDto>; degraded: boolean }> {
    // With an account cookie the real home feed works, without one youtube returns nothing
    if (process.env.VIEWTUBE_YOUTUBE_COOKIE) {
      try {
        const client = await innertubeClient();
        const homeFeedVideos = toHomeFeed(await client.getHomeFeed());

        if (homeFeedVideos.length >= MIN_REAL_HOME_FEED_VIDEOS) {
          return { videos: homeFeedVideos.slice(0, MAX_HOME_FEED_VIDEOS), degraded: false };
        }

        this.logger.warn(
          `Home feed returned ${homeFeedVideos.length} videos, using category feed instead`
        );
      } catch (error) {
        this.logger.warn(`Home feed request failed: ${error?.message}`);
      }
    }

    return this.categoryFeedService.getMixedFeed();
  }
}
