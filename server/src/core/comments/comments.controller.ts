import { Controller, Get, Query, Param, UseInterceptors, Header } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CommentsResponseDto } from './dto/comments-response.dto';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Header('Cache-Control', 'public, max-age=1800')
  @Get(':videoId')
  getComments(
    @Param('videoId') videoId: string,
    @Query('sortByNewest') sortByNewest = false,
    @Query('continuation') continuation: string = null
  ): Promise<CommentsResponseDto> {
    return this.commentsService.getComments(videoId, sortByNewest, continuation);
  }

  @Header('Cache-Control', 'public, max-age=1800')
  @Get(':videoId/replies')
  getCommentReplies(
    @Param('videoId') videoId: string,
    @Query('replyToken') replyToken: string
  ): Promise<CommentsResponseDto> {
    return this.commentsService.getCommentReplies(videoId, replyToken);
  }
}
