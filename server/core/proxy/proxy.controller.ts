import { Readable } from 'stream';
import { Controller, Get, Query, Header, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ProxyService } from './proxy.service';

@ApiTags('Core')
@Controller('proxy')
@Throttle(10000, 600)
export class ProxyController {
  constructor(private proxyService: ProxyService) {}

  @Get('text')
  @Header('Content-Type', 'text/plain')
  @Header('Cache-Control', 'no-cache')
  getText(@Query('url') url: string, @Query('local') local: boolean = true): Promise<string> {
    return this.proxyService.proxyText(url, local);
  }

  @Get('image')
  @Header('Content-Type', 'image/jpeg')
  @Header('Cache-Control', 'no-cache')
  async getQuery(
    @Query('url') url: string,
    @Query('local') local: boolean = false
  ): Promise<StreamableFile> {
    const stream = await this.proxyService.proxyImage(url, local);
    return new StreamableFile(stream);
  }

  @Get('stream')
  @Header('Cache-Control', 'no-cache')
  proxyStream(@Query('url') url: string): Promise<Readable> {
    return this.proxyService.proxyStream(url);
  }
}
