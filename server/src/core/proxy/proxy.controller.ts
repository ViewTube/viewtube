import { Controller, Get, Query, Header, Res, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ProxyService } from './proxy.service';
import { BypassAuth } from 'server/auth/decorators/bypass-auth.decorator';

@ApiTags('Core')
@BypassAuth()
@Controller('proxy')
export class ProxyController {
  constructor(private proxyService: ProxyService) {}

  @Get('text')
  @Header('Content-Type', 'text/plain')
  @Header('Cache-Control', 'public, max-age=28800')
  getText(@Query('url') url: string, @Query('local') local = true): Promise<string> {
    return this.proxyService.proxyText(url, local);
  }

  @Get('image')
  @Header('Cache-Control', 'public, max-age=14400')
  @Header('Content-Type', 'image/jpeg')
  async getQuery(
    @Query('url') url: string,
    @Query('local') local = false,
    @Res() reply: FastifyReply
  ): Promise<void> {
    await this.proxyService.proxyImage(url, reply, local);
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
