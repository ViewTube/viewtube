import { Controller, Get, Query, Res, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { ProxyService } from './proxy.service';

@ApiTags('Core')
@Controller('proxy')
export class ProxyController {
  constructor(private proxyService: ProxyService) {}

  @Get('text')
  @Header('Content-Type', 'text/plain')
  @Header('Cache-Control', 'no-cache')
  getText(@Query('url') url: string, @Query('local') local: boolean = true): Promise<string> {
    return this.proxyService.proxyText(url, local);
  }

  @Get('image')
  @Header('Content-Type', 'image/jpg')
  @Header('Cache-Control', 'no-cache')
  async getQuery(
    @Query('url') url: string,
    @Query('local') local: boolean = false,
    @Res() reply: FastifyReply
  ): Promise<void> {
    const image = await this.proxyService.proxyImage(url, local);
    reply.send(image);
  }

  @Get('stream')
  @Header('Cache-Control', 'no-cache')
  async proxyStream(@Query('url') url: string, @Res() reply: FastifyReply): Promise<void> {
    const streamBuffer = await this.proxyService.proxyStream(url);
    reply.send(streamBuffer);
  }
}
