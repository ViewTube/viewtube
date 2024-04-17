import { Controller, Get, Header, Query, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ProxyService } from './proxy.service';

@ApiTags('Core')
@Controller('proxy')
export class ProxyController {
  constructor(private proxyService: ProxyService) {}

  @Get('image')
  @Header('Cache-Control', 'public, max-age=14400')
  @Header('Content-Type', 'image/jpeg')
  async getQuery(
    @Query('url') url: string,
    @Query('local') local: boolean,
    @Res() reply: FastifyReply
  ): Promise<void> {
    await this.proxyService.proxyImage(url, reply, local);
  }

  @Get('text')
  @Header('Cache-Control', 'public, max-age=86400')
  @Header('Content-Type', 'text/xml')
  async proxyText(@Query('url') url: string, @Res() reply: FastifyReply): Promise<void> {
    await this.proxyService.proxyText(url, reply);
  }

  @Get('stream')
  @Header('Cache-Control', 'public, max-age=7200')
  async proxyStream(
    @Query('url') url: string,
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply
  ): Promise<void> {
    await this.proxyService.proxyStream(url, request, reply);
  }
}
