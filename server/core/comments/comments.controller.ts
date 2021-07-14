import { Controller, Get, Query, Param, CacheInterceptor, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CommentsResponseDto } from './dto/comments-response.dto';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get(':videoId')
  getComments(
    @Param('videoId') videoId: string,
    @Query('sortByNewest') sortByNewest: boolean = false,
    @Query('continuation') continuation: string = null
  ): Promise<CommentsResponseDto> {
    return this.commentsService.getComments(videoId, sortByNewest, continuation);
  }

  @Get(':videoId/replies')
  getCommentReplies(
    @Param('videoId') videoId: string,
    @Query('replyToken') replyToken: string
  ): Promise<CommentsResponseDto> {
    return this.commentsService.getCommentReplies(videoId, replyToken);
  }
}
