import { Duplex } from 'stream';
import {
  Controller,
  Get,
  Param,
  CacheInterceptor,
  UseInterceptors,
  StreamableFile
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
import { ChannelDto } from './dto/channel.dto';

@ApiTags('Core')
@Controller('channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Get(':id/thumbnail/tiny.jpg')
  getTinyThumbnailJpg(@Param('id') id: string): StreamableFile {
    const thumbnail = this.channelsService.getTinyThumbnail(id);
    if (thumbnail && thumbnail instanceof Duplex) {
      return new StreamableFile(thumbnail);
    }
  }

  @Get(':id/thumbnail/tiny.webp')
  getTinyThumbnailWebp(@Param('id') id: string) {
    const thumbnail = this.channelsService.getTinyThumbnail(id);
    if (thumbnail && thumbnail instanceof Duplex) {
      return new StreamableFile(thumbnail);
    }
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  getChannel(@Param('id') channelId: string): Promise<ChannelDto> {
    return this.channelsService.getChannel(channelId);
  }
}
