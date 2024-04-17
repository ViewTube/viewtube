import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from 'server/auth/decorators/public.decorator';
import type { NuxtService } from './nuxt.service';

@Controller()
@Public()
@ApiExcludeController()
export class NuxtController {
  constructor(private nuxtService: NuxtService) {}

  @Get('*')
  getPage(@Req() request: FastifyRequest, @Res() reply: FastifyReply): void {
    return this.nuxtService.getPage(request, reply);
  }
}
