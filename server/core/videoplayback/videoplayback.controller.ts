import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VideoplaybackService } from './videoplayback.service';

@ApiTags('Core')
@Controller('videoplayback')
export class VideoplaybackController {
  constructor(private videoplaybackService: VideoplaybackService) {}

  // @Get(':id/default.mp4')
  // getVideoplayback(
  //   @Res() reply: FastifyReply,
  //   @Param('id') id: string
  // ) {
  //   this.videoplaybackService.getVideoStream(id, reply);
  // }
}
