import { Controller, Get, Header, Req, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL, CacheKey } from '@nestjs/cache-manager';
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
  getHomeFeed(@Req() request): Promise<HomeFeedDto> {
    console.log(request.headers);
    return this.homepageService.getHomeFeed();
  }
}
