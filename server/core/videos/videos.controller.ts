import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  CacheInterceptor,
  Req
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VideoDto } from 'shared/dto/video/video.dto';
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
  @Get(':id')
  getVideos(@Param('id') id: string, @Req() request: any): Promise<VideoDto> {
    console.log(request.user.username);
    return this.videosService.getById(id);
  }
}
