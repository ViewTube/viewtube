import {
  Controller,
  Get,
  Param,
  Res,
  CacheInterceptor,
  UseInterceptors
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ChannelDto } from './dto/channel.dto';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
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
  @UseInterceptors(CacheInterceptor)
  getChannel(@Param('id') channelId: string): Promise<ChannelDto> {
    return this.channelsService.getChannel(channelId);
  }
}
