import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  CacheInterceptor,
  UseInterceptors
} from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
import { ChannelDto } from './dto/channel.dto';

@ApiTags('Core')
@Controller('channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  @Get(':id/thumbnail/tiny.jpg')
  getTinyThumbnail(@Res() res: Response, @Param('id') id: string) {
    const imgPath = path.join(global['__basedir'], `channels/${id}.jpg`);

    if (fs.existsSync(imgPath)) {
      res.sendFile(imgPath);
    } else {
      throw new NotFoundException();
    }
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  getChannel(@Param('id') channelId: string): Promise<ChannelDto> {
    return this.channelsService.getChannel(channelId);
  }
}
