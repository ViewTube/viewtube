import { Injectable } from '@nestjs/common';
import { innertubeClient } from 'server/common/innertube/innertube';
import { mapHomeFeed } from './mapper/homefeed.mapper';
import { HomeFeedDto } from './dto/home-feed.dto';

@Injectable()
export class HomepageService {
  async getHomeFeed(): Promise<HomeFeedDto> {
    const client = await innertubeClient;
    const homeFeed = await client.getHomeFeed();
    return {
      videos: mapHomeFeed(homeFeed)
    };
  }
}
