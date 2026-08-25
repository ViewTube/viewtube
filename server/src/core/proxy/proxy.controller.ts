import { Controller, Get, Header, Headers, Query, Res, StreamableFile } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { IncomingHttpHeaders } from 'node:http';
import { ProxyImageQueryDto } from './dto/proxy-image-query.dto';
import { ProxyStreamQueryDto } from './dto/proxy-stream-query.dto';
import { ProxyTextQueryDto } from './dto/proxy-text-query.dto';
import { ProxyService } from './proxy.service';

@ApiTags('Core')
@Controller('proxy')
export class ProxyController {
  constructor(private proxyService: ProxyService) {}

  @Get('image')
  @ApiOkResponse({
    description: 'The proxied image, streamed from YouTube.',
    content: { 'image/*': { schema: { type: 'string', format: 'binary' } } }
  })
  @Header('Cache-Control', 'public, max-age=14400')
  async proxyImage(@Query() query: ProxyImageQueryDto): Promise<StreamableFile> {
    return this.proxyService.proxyImage(query.url);
  }

  @Get('text')
  @ApiOkResponse({
    description: 'The proxied timedtext document, streamed from YouTube.',
    content: { 'text/xml': { schema: { type: 'string', format: 'binary' } } }
  })
  @Header('Cache-Control', 'public, max-age=86400')
  async proxyText(@Query() query: ProxyTextQueryDto): Promise<StreamableFile> {
    return this.proxyService.proxyText(query.url);
  }

  @Get('stream')
  @ApiOkResponse({
    description: 'The proxied stream, or an hls manifest rewritten to point back at this endpoint.',
    content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } }
  })
  async proxyStream(
    @Query() query: ProxyStreamQueryDto,
    @Headers() headers: IncomingHttpHeaders,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<StreamableFile | string> {
    return this.proxyService.proxyStream(query, headers, reply);
  }
}
