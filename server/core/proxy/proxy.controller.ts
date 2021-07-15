import {
  Controller,
  Get,
  Query,
  Res,
  Header
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ProxyService } from './proxy.service';

@ApiTags('Core')
@Controller('proxy')
export class ProxyController {
  constructor(private proxyService: ProxyService) {}

  @Get('image')
  @Header('Content-Type', 'image/jpg')
  @Header('Cache-Control', 'no-cache')
  async getQuery(
    @Query('url') url: string,
    @Query('local') local: boolean = false,
    @Res() response: Response
  ): Promise<void> {
    const image = await this.proxyService.proxyImage(url, local, response);
    response.send(image);
  }

  @Get('stream')
  @Header('Cache-Control', 'no-cache')
  async proxyStream(@Query('url') url: string, @Res() response: Response): Promise<void> {
    const streamBuffer = await this.proxyService.proxyStream(url, response);
    response.send(streamBuffer);
  }
}
