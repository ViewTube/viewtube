import { Injectable, InternalServerErrorException } from '@nestjs/common';
import ytcm from '@freetube/yt-comment-scraper';
import { mapComments } from './comments.mapper';
import { CommentsResponseDto } from './dto/comments-response.dto';

@Injectable()
export class CommentsService {
  async getComments(
    videoId: string,
    sortByNewest: boolean,
    continuation: string
  ): Promise<CommentsResponseDto> {
    const commentsPayload: any = {
      videoId,
      sortByNewest,
      mustSetCookie: true
    };
    if (continuation) {
      commentsPayload.continuation = continuation;
    }
    let commentsRawResult = null;
    let index = 0;
    const retryCounter = 10;

    while (!commentsRawResult && index < retryCounter) {
      try {
        commentsRawResult = await this.tryGetComments(commentsPayload);
      } catch {
        // Silently ignore exception
      }
      index++;
    }
    if (commentsRawResult) {
      const commentsResult = mapComments(commentsRawResult);
      return commentsResult;
    }
    throw new InternalServerErrorException('Error fetching comments');
  }

  tryGetComments(commentsPayload: any) {
    return ytcm.getComments(commentsPayload);
  }

  async getCommentReplies(videoId: string, replyToken: string): Promise<CommentsResponseDto> {
    try {
      const commentsRawResult = await ytcm.getCommentReplies({
        videoId,
        replyToken,
        mustSetCookie: true
      });
      if (commentsRawResult) {
        const commentsResult = mapComments(commentsRawResult);
        return commentsResult;
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
    throw new InternalServerErrorException('Error fetching replies');
  }
}
