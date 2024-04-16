import { Injectable } from '@nestjs/common';
import { innertubeClient } from 'server/common/innertube/innertube';
import { toVTCommentsReplyResponseDto } from 'server/mapper/converter/comments/vt-comments-reply.converter';
import { VTCommentsReplyResponseDto } from 'server/mapper/converter/comments/vt-comments-reply.response.dto';
import { VTCommentsResponseDto } from 'server/mapper/converter/comments/vt-comments-response.dto';
import { toVTCommentsResponseDto } from 'server/mapper/converter/comments/vt-comments.converter';

import { Proto, YTNodes } from 'youtubei.js';

@Injectable()
export class CommentsService {
  async getComments(
    videoId: string,
    sortByNewest: boolean,
    continuationString?: string
  ): Promise<VTCommentsResponseDto> {
    const innertube = await innertubeClient();

    const sortBy = sortByNewest ? 'NEWEST_FIRST' : 'TOP_COMMENTS';

    let commentParams: Record<string, any> = {};

    if (continuationString) {
      commentParams = {
        continuation: continuationString,
        parse: true
      };
    } else {
      commentParams = {
        continuation: Proto.encodeCommentsSectionParams(videoId, {
          sort_by: sortBy
        }),
        parse: true
      };
    }

    const commentsResponse: any = await innertube.actions.execute('next', commentParams);

    const commentsEndpoint = commentsResponse?.on_response_received_endpoints;

    const headerNode = commentsEndpoint?.find(
      content => content.slot === 'RELOAD_CONTINUATION_SLOT_HEADER'
    );
    const contentsNode = commentsEndpoint?.find(
      content =>
        content.slot === 'RELOAD_CONTINUATION_SLOT_BODY' ||
        content.type === 'AppendContinuationItemsAction'
    );

    const commentsContents = contentsNode?.contents?.filterType(YTNodes.CommentThread);
    const commentsHeader = headerNode?.contents?.firstOfType(YTNodes.CommentsHeader);

    const { comments, header } = toVTCommentsResponseDto(commentsContents, commentsHeader);

    const continuation = contentsNode?.contents?.firstOfType(YTNodes.ContinuationItem)?.endpoint
      ?.payload?.token;

    return {
      comments,
      header,
      continuation
    };
  }

  async getCommentReplies(replyContinuation: string): Promise<VTCommentsReplyResponseDto> {
    const innertube = await innertubeClient();

    const commentParams: Record<string, any> = {
      continuation: replyContinuation,
      parse: true
    };

    const commentsResponse: any = await innertube.actions.execute('next', commentParams);

    const commentsEndpoint = commentsResponse?.on_response_received_endpoints;

    const contentsNode = commentsEndpoint?.find(
      (content: any) =>
        content.slot === 'RELOAD_CONTINUATION_SLOT_BODY' ||
        content.type === 'AppendContinuationItemsAction'
    );

    const commentsContents = contentsNode?.contents?.filterType(YTNodes.CommentView);

    const { comments } = toVTCommentsReplyResponseDto(commentsContents);

    const continuationItem = contentsNode?.contents?.firstOfType(YTNodes.ContinuationItem);

    const continuation =
      continuationItem?.endpoint?.payload?.token ??
      continuationItem?.button?.endpoint?.payload?.token;

    return {
      comments,
      continuation
    };
  }
}
