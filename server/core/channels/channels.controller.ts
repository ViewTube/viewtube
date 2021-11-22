import {
  Controller,
  Get,
  Param,
  CacheInterceptor,
  UseInterceptors,
  Res,
  Header
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { ChannelsService } from './channels.service';
import { ChannelDto } from './dto/channel.dto';

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

  @UseInterceptors(CacheInterceptor)
  @Header('Cache-Control', 'public, max-age=1800')
  @Get(':id')
  getChannel(@Param('id') channelId: string): Promise<ChannelDto> {
    return this.channelsService.getChannel(channelId);
  }
}
