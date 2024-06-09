import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Header, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HomeFeedDto } from './dto/home-feed.dto';
import { HomepageService } from './homepage.service';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('homepage')
export class HomepageController {
  constructor(private homepageService: HomepageService) {}

  @Get('homefeed')
  @CacheTTL(43200000)
  @CacheKey('homefeed')
  @Header('Cache-Control', 'public, max-age=43200')
  getHomeFeed(): Promise<HomeFeedDto> {
    return this.homepageService.getHomeFeed();
  }
}
