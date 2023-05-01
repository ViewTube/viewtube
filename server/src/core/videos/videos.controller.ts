import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Header
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { DislikeDto } from 'server/core/videos/dto/dislike.dto';
import { VideosService } from './videos.service';
import { VTVideoInfoDto } from 'server/mapper/dto/vt-video-info.dto';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    excludePrefixes: ['_']
  })
  @CacheTTL(18000000)
  @Header('Cache-Control', 'public, max-age=18000')
  @Get(':id')
  getVideos(@Param('id') id: string): Promise<VTVideoInfoDto> {
    return this.videosService.getById(id);
  }

  @CacheTTL(18000000)
  @Header('Cache-Control', 'public, max-age=18000')
  @Get('dislikes/:id')
  getDislikes(@Param('id') id: string): Promise<DislikeDto> {
    return this.videosService.getDislikes(id);
  }
}
