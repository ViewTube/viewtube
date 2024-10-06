import { Injectable } from '@nestjs/common';
import { innertubeClient } from 'server/common/innertube/innertube';
import { toVTCommentsReplyResponseDto } from 'server/mapper/converter/comments/vt-comments-reply.converter';
import { VTCommentsReplyResponseDto } from 'server/mapper/converter/comments/vt-comments-reply.response.dto';
import { VTCommentsResponseDto } from 'server/mapper/converter/comments/vt-comments-response.dto';
import { toVTCommentsResponseDto } from 'server/mapper/converter/comments/vt-comments.converter';

import { YTNodes } from 'youtubei.js';
import { GetCommentsSectionParams } from 'youtubei.js/dist/protos/generated/misc/params.js';
import { u8ToBase64 } from 'youtubei.js/dist/src/utils/Utils';
@Injectable()
export class CommentsService {
  async getComments(
    videoId: string,
    sortByNewest: boolean,
    continuationString?: string
  ): Promise<VTCommentsResponseDto> {
    const innertube = await innertubeClient();

    const SORT_OPTIONS = {
      TOP_COMMENTS: 0,
      NEWEST_FIRST: 1
    };

    const sortBy = sortByNewest ? 'NEWEST_FIRST' : 'TOP_COMMENTS';

    let commentParams: Record<string, any> = {};

    if (continuationString) {
      commentParams = {
        continuation: continuationString,
        parse: true
      };
    } else {
      const writer = GetCommentsSectionParams.encode({
        ctx: {
          videoId
        },
        unkParam: 6,
        params: {
          opts: {
            videoId,
            sortBy: SORT_OPTIONS[sortBy],
            type: 2,
            commentId: ''
          },
          target: 'comments-section'
        }
      });
      const continuation = encodeURIComponent(u8ToBase64(writer.finish()));
      commentParams = {
        continuation,
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
