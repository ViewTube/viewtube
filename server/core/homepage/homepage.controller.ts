import {
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  Controller,
  Get,
  UseInterceptors
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetricsInterceptor } from 'server/metrics/metrics.interceptor';
import { PopularDto } from './dto/popular.dto';
import { HomepageService } from './homepage.service';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@UseInterceptors(MetricsInterceptor)
@Controller('homepage')
export class HomepageController {
  constructor(private homepageService: HomepageService) {}

  @Get('popular')
  @CacheTTL(43200)
  @CacheKey('popular')
  getPopular(): Promise<PopularDto> {
    return this.homepageService.getPopular();
  }
}
