import { Controller, Get, Query, Header, Res, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ProxyService } from './proxy.service';

@ApiTags('Core')
@Controller('proxy')
@Throttle(10000, 600)
export class ProxyController {
  constructor(private proxyService: ProxyService) {}

  @Get('text')
  @Header('Content-Type', 'text/plain')
  @Header('Cache-Control', 'public, max-age=28800')
  getText(@Query('url') url: string, @Query('local') local = true): Promise<string> {
    return this.proxyService.proxyText(url, local);
  }

  @Header('Cache-Control', 'public, max-age=14400')
  @Header('Content-Type', 'image/jpeg')
  @Get('image')
  async getQuery(
    @Query('url') url: string,
    @Query('local') local = false,
    @Res() reply: FastifyReply
  ): Promise<void> {
    await this.proxyService.proxyImage(url, reply, local);
  }

  @Header('Cache-Control', 'public, max-age=7200')
  @Get('stream')
  async proxyStream(
    @Query('url') url: string,
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply
  ): Promise<void> {
    return await this.proxyService.proxyStream(url, request, reply);
  }
}
