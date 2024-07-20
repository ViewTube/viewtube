import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { FastifyReply } from 'fastify';
import { innertubeClient } from 'server/common/innertube/innertube';
import { ViewTubeRequest } from 'server/common/viewtube-request';
import { HistoryService } from 'server/user/history/history.service';
import { toHomeFeed } from '../../mapper/converter/homefeed/homefeed.converter';
import { HomeFeedDto } from './dto/home-feed.dto';

@Injectable()
export class HomepageService {
  constructor(
    private historyService: HistoryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getHomeFeed(request: ViewTubeRequest, reply: FastifyReply): Promise<HomeFeedDto> {
    if (!request?.user?.username) {
      const cachedValue = await this.cacheManager.get<HomeFeedDto>('homefeed');
      if (cachedValue) return cachedValue;
    }
    const client = await innertubeClient();
    const homeFeed = await client.getTrending();
    const homeFeedLimited = homeFeed.videos.slice(0, 40);
    const homeFeedVideos = toHomeFeed({ videos: homeFeedLimited } as never);
    const enhancedHomeFeed = await this.historyService.enhanceVideoListWithHistory(
      request?.user?.username,
      homeFeedVideos
    );

    if (!request?.user?.username) {
      this.cacheManager.set(
        'homefeed',
        {
          videos: enhancedHomeFeed
        },
        43200000
      );
      reply.header('Cache-Control', 'public, max-age=43200');
    }

    return {
      videos: enhancedHomeFeed
    };
  }
}
