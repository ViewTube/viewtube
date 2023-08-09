import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { VideoplaybackService } from './videoplayback.service';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Core')
@Controller('videoplayback')
export class VideoplaybackController {
  constructor(private videoplaybackService: VideoplaybackService) {}

  @Get()
  @Throttle(2500, 600)
  async getVideoplayback(@Res() reply: FastifyReply, @Req() request: FastifyRequest) {
    await this.videoplaybackService.proxyStream(request, reply);
  }
}
