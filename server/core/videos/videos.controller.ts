import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  CacheInterceptor,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideoDto } from './dto/video.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    excludePrefixes: ['_'],
  })
  @Get(':id')
  getVideos(@Param('id') id: string): Promise<VideoDto> {
    return this.videosService.getById(id);
  }
}
