import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Header
} from '@nestjs/common';
import { CacheInterceptor,CacheTTL } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { VideoDto } from 'server/core/videos/dto/video.dto';
import { DislikeDto } from 'server/core/videos/dto/dislike.dto';
import { VideosService } from './videos.service';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    excludePrefixes: ['_']
  })
  @CacheTTL(18000)
  @Header('Cache-Control', 'public, max-age=18000')
  @Get(':id')
  getVideos(@Param('id') id: string): Promise<VideoDto> {
    return this.videosService.getById(id);
  }

  @CacheTTL(1800)
  @Header('Cache-Control', 'public, max-age=1800')
  @Get('manifest/dash/:id')
  getDashManifest(@Param('id') id: string): Promise<string> {
    return this.videosService.getDashManifest(id);
  }

  @CacheTTL(18000)
  @Header('Cache-Control', 'public, max-age=18000')
  @Get('dislikes/:id')
  getDislikes(@Param('id') id: string): Promise<DislikeDto> {
    return this.videosService.getDislikes(id);
  }
}
