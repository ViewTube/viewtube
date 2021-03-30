import { Controller, Get, Query, Res, Header, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CommentsService } from './comments.service';

@ApiTags('Core')
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get(':videoId')
  async getQuery(@Param('videoId') videoId: string): Promise<void> {}
}
