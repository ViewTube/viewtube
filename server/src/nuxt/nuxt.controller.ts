import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { NuxtService } from './nuxt.service';
import { Public } from 'server/auth/decorators/public.decorator';

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
