import {
  Controller,
  Get,
  Param,
  CacheInterceptor,
  UseInterceptors,
  Res,
  Header
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { ChannelsService } from './channels.service';
import { ChannelHomeDto } from './dto/response/channel-home.dto';
import { ChannelVideosDto } from './dto/response/channel-videos.dto';

@ApiTags('Core')
@Controller('channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Get(':id/thumbnail/tiny.jpg')
  @Header('Cache-Control', 'public, max-age=18000')
  getTinyThumbnailJpg(@Param('id') id: string, @Res() reply: FastifyReply): void {
    this.channelsService.getTinyThumbnail(reply, id);
  }

  @Get(':id/thumbnail/tiny.webp')
  @Header('Cache-Control', 'public, max-age=18000')
  getTinyThumbnailWebp(@Param('id') id: string, @Res() reply: FastifyReply): void {
    this.channelsService.getTinyThumbnail(reply, id);
  }

  @Header('Cache-Control', 'public, max-age=1800')
  @Get(':id/home')
  @ApiResponse({ status: 200, type: ChannelHomeDto })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  getChannelHome(@Param('id') channelId: string): Promise<ChannelHomeDto> {
    return this.channelsService.getChannelHome(channelId);
  }

  @Header('Cache-Control', 'public, max-age=1800')
  @Get(':id/videos')
  @ApiResponse({ status: 200, type: ChannelVideosDto })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 500 })
  @UseInterceptors(CacheInterceptor)
  getChannelVideos(@Param('id') channelId: string): Promise<ChannelVideosDto> {
    return this.channelsService.getChannelVideos(channelId);
  }
}
