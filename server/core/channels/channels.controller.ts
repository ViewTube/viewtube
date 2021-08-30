import { Controller, Get, Param, Res, CacheInterceptor, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { ChannelsService } from './channels.service';
import { ChannelDto } from './dto/channel.dto';

@ApiTags('Core')
@Controller('channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}
  @Get(':id/thumbnail/tiny.jpg')
  async getTinyThumbnailJpg(@Res() reply: FastifyReply, @Param('id') id: string) {
    await this.channelsService.getTinyThumbnail(reply, id);
  }

  @Get(':id/thumbnail/tiny.webp')
  async getTinyThumbnailWebp(@Res() reply: FastifyReply, @Param('id') id: string) {
    await this.channelsService.getTinyThumbnail(reply, id);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  getChannel(@Param('id') channelId: string): Promise<ChannelDto> {
    return this.channelsService.getChannel(channelId);
  }
}
