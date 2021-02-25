import { Controller, Get, Query, CacheInterceptor, UseInterceptors, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ProxyService } from './proxy.service';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('proxy')
export class ProxyController {
  constructor(private proxyService: ProxyService) {}

  @Get('image')
  getQuery(@Query('url') url: string, @Res() response: Response): Promise<void> {
    return this.proxyService.proxyImage(url, response);
  }
}
