import { Injectable, InternalServerErrorException } from '@nestjs/common';
import ytcm from '@freetube/yt-comment-scraper';
import { mapComments } from './comments.mapper';
// import { CommentsResponseDto } from '../../mapper/converter/comments/vt-comments-response.dto';
import { innertubeClient } from 'server/common/innertube/innertube';
import { YTNodes } from 'youtubei.js';

@Injectable()
export class CommentsService {
  async getComments(
    videoId: string,
    sortByNewest: boolean,
    continuation?: string
  ): Promise<CommentsResponseDto> {
    const innertube = await innertubeClient();

    const sortBy = sortByNewest ? 'NEWEST_FIRST' : 'TOP_COMMENTS';

    const comments = await innertube.getComments(videoId, sortBy);

    const continuationToken = (comments.page.on_response_received_endpoints as any)
      .find(el => el?.slot === 'RELOAD_CONTINUATION_SLOT_BODY')
      ?.contents?.at(-1)?.endpoint?.payload?.token;

    return {
      comments: comments as any,
      continuation: comments.has_continuation as any,
      test: continuationToken
    };

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
    return (ytcm as any).getComments(commentsPayload);
  }

  async getCommentReplies(videoId: string, replyToken: string): Promise<CommentsResponseDto> {
    try {
      const commentsRawResult = await (ytcm as any).getCommentReplies({
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
