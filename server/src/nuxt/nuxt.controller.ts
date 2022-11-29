import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { NuxtService } from './nuxt.service';

@ApiTags('Frontend')
@Controller()
export class NuxtController {
  constructor(private nuxtService: NuxtService) {}

  @Get('*')
  getPage(@Req() request: FastifyRequest, @Res() reply: FastifyReply): void {
    this.nuxtService.getPage(request, reply);
  }

  @Get('_nuxt/:filename')
  getStaticNuxtFile(@Res() reply: FastifyReply, @Param('filename') filename: string): void {
    this.nuxtService.getStaticNuxtFile(reply, filename);
  }
}
