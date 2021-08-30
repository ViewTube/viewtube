import { Controller, Get, Query, Res, Header, HttpException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FastifyReply } from 'fastify';
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
    @Query('local') local: boolean = false,
    @Res() reply: FastifyReply
  ): Promise<void> {
    try {
      await this.proxyService.proxyImage(url, reply, local);
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  @Get('stream')
  @Header('Cache-Control', 'no-cache')
  async proxyStream(@Query('url') url: string, @Res() reply: FastifyReply): Promise<void> {
    try {
      const streamBuffer = await this.proxyService.proxyStream(url);
      reply.send(streamBuffer);
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }
}
