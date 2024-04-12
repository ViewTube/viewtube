import { Controller, Get, Query, Param, UseInterceptors, Header } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { VTCommentsResponseDto } from '../../mapper/converter/comments/vt-comments-response.dto';
import { VTCommentsReplyResponseDto } from 'server/mapper/converter/comments/vt-comments-reply.response.dto';

@ApiTags('Core')
@UseInterceptors(CacheInterceptor)
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Header('Cache-Control', 'public, max-age=7200')
  @CacheTTL(7200000)
  @Get(':videoId')
  @ApiQuery({ name: 'sortByNewest', required: false })
  @ApiQuery({ name: 'continuation', required: false })
  getComments(
    @Param('videoId') videoId: string,
    @Query('sortByNewest') sortByNewest?: boolean,
    @Query('continuation') continuation?: string
  ): Promise<VTCommentsResponseDto> {
    return this.commentsService.getComments(videoId, sortByNewest, continuation);
  }

  @Header('Cache-Control', 'public, max-age=7200')
  @Get(':videoId/replies')
  @CacheTTL(7200000)
  getCommentReplies(@Query('replyToken') replyToken: string): Promise<VTCommentsReplyResponseDto> {
    return this.commentsService.getCommentReplies(replyToken);
  }
}
