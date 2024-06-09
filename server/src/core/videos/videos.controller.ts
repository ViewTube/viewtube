import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Header, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DislikeDto } from 'server/core/videos/dto/dislike.dto';
import { VTVideoInfoDto } from 'server/mapper/dto/vt-video-info.dto';
import { SponsorBlockSegmentsDto } from './dto/sponsorblock/sponsorblock-segments.dto';
import { VideosService } from './videos.service';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @CacheTTL(300000)
  @Header('Cache-Control', 'public, max-age=300')
  @Get(':id')
  getVideos(@Param('id') id: string): Promise<VTVideoInfoDto> {
    return this.videosService.getById(id);
  }

  @CacheTTL(300000)
  @Header('Cache-Control', 'public, max-age=300')
  @Header('Content-Type', 'application/dash+xml')
  @Get(':id/dash')
  getDash(@Param('id') id: string): Promise<string> {
    return this.videosService.getDash(id);
  }

  @CacheTTL(43200000)
  @Header('Cache-Control', 'public, max-age=43200')
  @Get(':id/dislikes')
  getDislikes(@Param('id') id: string): Promise<DislikeDto> {
    return this.videosService.getDislikes(id);
  }

  @CacheTTL(21600000)
  @Header('Cache-Control', 'public, max-age=21600')
  @Get(':id/skipSegments')
  getSkipSegments(
    @Param('id') id: string,
    @Query('url') url?: string
  ): Promise<SponsorBlockSegmentsDto> {
    return this.videosService.getSkipSegments(id, url);
  }
}
