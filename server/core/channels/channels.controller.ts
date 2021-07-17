import { Controller, Get, Param, Res, CacheInterceptor, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { MetricsInterceptor } from 'server/metrics/metrics.interceptor';
import { ChannelsService } from './channels.service';
import { ChannelDto } from './dto/channel.dto';

@ApiTags('Core')
@Controller('channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}
  @Get(':id/thumbnail/tiny.jpg')
  getTinyThumbnailJpg(@Res() res: Response, @Param('id') id: string) {
    this.channelsService.getTinyThumbnail(res, id);
  }

  @Get(':id/thumbnail/tiny.webp')
  getTinyThumbnailWebp(@Res() res: Response, @Param('id') id: string) {
    this.channelsService.getTinyThumbnail(res, id);
  }

  @Get(':id')
  @UseInterceptors(MetricsInterceptor)
  @UseInterceptors(CacheInterceptor)
  getChannel(@Param('id') channelId: string): Promise<ChannelDto> {
    return this.channelsService.getChannel(channelId);
  }
}
