import {
  Controller,
  Get,
  Param,
  CacheInterceptor,
  UseInterceptors,
  Res
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
  getTinyThumbnailJpg(@Param('id') id: string, @Res() reply: FastifyReply): void {
    this.channelsService.getTinyThumbnail(reply, id);
  }

  @Get(':id/thumbnail/tiny.webp')
  getTinyThumbnailWebp(@Param('id') id: string, @Res() reply: FastifyReply): void {
    this.channelsService.getTinyThumbnail(reply, id);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  getChannel(@Param('id') channelId: string): Promise<ChannelDto> {
    return this.channelsService.getChannel(channelId);
  }
}
