import { Controller, Get, Query, Param, UseInterceptors, Header } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CommentsResponseDto } from '../../mapper/converter/comments/vt-comments-response.dto';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Header('Cache-Control', 'public, max-age=1800')
  @Get(':videoId')
  @ApiQuery({ name: 'sortByNewest', required: false })
  @ApiQuery({ name: 'continuation', required: false })
  getComments(
    @Param('videoId') videoId: string,
    @Query('sortByNewest') sortByNewest?: boolean,
    @Query('continuation') continuation?: string
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
