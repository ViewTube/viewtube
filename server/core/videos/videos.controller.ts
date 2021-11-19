import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  CacheInterceptor,
  CacheTTL
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VideoDto } from 'viewtube/shared/dto/video/video.dto';
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
  @Get(':id')
  getVideos(@Param('id') id: string): Promise<VideoDto> {
    return this.videosService.getById(id);
  }

  @CacheTTL(1800)
  @Get('manifest/dash/:id')
  getDashManifest(@Param('id') id: string): Promise<string> {
    return this.videosService.getDashManifest(id);
  }
}
