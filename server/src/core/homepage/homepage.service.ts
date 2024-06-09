import { Injectable } from '@nestjs/common';
import { innertubeClient } from 'server/common/innertube/innertube';
import { HomeFeedDto } from './dto/home-feed.dto';
import { mapHomeFeed } from './mapper/homefeed.mapper';

@Injectable()
export class HomepageService {
  async getHomeFeed(): Promise<HomeFeedDto> {
    const client = await innertubeClient();
    const homeFeed = await client.getTrending();
    return {
      videos: mapHomeFeed(homeFeed)
    };
  }
}
