import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { BypassAuth } from 'server/auth/decorators/bypass-auth.decorator';
import type { VideoplaybackService } from './videoplayback.service';

@ApiTags('Core')
@BypassAuth()
@Controller('videoplayback')
export class VideoplaybackController {
  constructor(private videoplaybackService: VideoplaybackService) {}

  @Get()
  async getVideoplayback(@Res() reply: FastifyReply, @Req() request: FastifyRequest) {
    await this.videoplaybackService.proxyStream(request, reply);
  }
}
