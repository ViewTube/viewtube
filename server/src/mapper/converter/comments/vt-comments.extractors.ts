import { YTNodes } from 'youtubei.js';
import { parseRelativeTime } from 'server/mapper/utils/parse-relative-time';
import { parseShortenedNumber } from 'server/mapper/utils/shortened-number';
import { VTCommentDto } from 'server/mapper/dto/comments/vt-comment.dto';
import { Comment, CommentView } from 'youtubei.js/dist/src/parser/nodes';
import { VTCommentsHeaderDto } from 'server/mapper/dto/comments/vt-comments-header.dto';

// export const extractContinuation = (comments: YT.Comments): string => {
//   const continuationToken = (comments?.page?.on_response_received_endpoints as any[])
//     .find(el => el?.slot === 'RELOAD_CONTINUATION_SLOT_BODY')
//     ?.contents?.at(-1)?.endpoint?.payload?.token;
//   return continuationToken;
// };

export const extractHeader = (header: YTNodes.CommentsHeader): VTCommentsHeaderDto => {
  if (!header) return null;
  return {
    commentsCount: parseShortenedNumber(header?.comments_count?.text),
    customEmojis: header?.custom_emojis?.map(emoji => {
      return {
        name: emoji.emoji_id,
        shortcuts: emoji.shortcuts,
        thumbnails: emoji.image
      };
    })
  };
};

export const extractCommentViews = (comments: YTNodes.CommentView[]): Array<VTCommentDto> => {
  return comments?.map(comment => {
    return {
      id: comment?.comment_id,
      content: comment?.content?.text,
      author: {
        id: comment?.author?.id,
        name: comment?.author?.name,
        isArtist: comment?.author?.is_verified_artist,
        isVerified: comment?.author?.is_verified
      },
      likeCount: parseShortenedNumber(comment?.like_count),
      replyCount: parseShortenedNumber(comment?.reply_count),
      published: {
        date: parseRelativeTime(comment?.published_time)?.toDate(),
        text: comment?.published_time
      },
      pinned: comment?.is_pinned,
      creatorHeart: comment?.is_hearted,
      channelMember: comment?.is_member,
      channelOwner: comment?.author_is_channel_owner
    };
  });
};

export const extractComments = (comments: YTNodes.CommentThread[]): Array<VTCommentDto> => {
  return comments?.map(comment => {
    return {
      id: comment?.comment?.comment_id,
      content: comment?.comment?.content?.text,
      author: {
        id: comment?.comment?.author?.id,
        name: comment?.comment?.author?.name,
        isArtist: comment?.comment?.author?.is_verified_artist,
        isVerified: comment?.comment?.author?.is_verified
      },
      likeCount: parseShortenedNumber((comment?.comment as CommentView)?.like_count),
      hasReplies: comment?.has_replies,
      replyCount: parseShortenedNumber((comment?.comment as CommentView)?.reply_count),
      published: {
        date: parseRelativeTime(
          (comment?.comment as CommentView)?.published_time ??
            (comment?.comment as Comment)?.published?.text
        )?.toDate(),
        text:
          (comment?.comment as CommentView)?.published_time ??
          (comment?.comment as Comment)?.published?.text
      },
      pinned: comment?.comment?.is_pinned,
      creatorHeart: comment?.comment?.is_hearted,
      channelMember: comment?.comment?.is_member,
      channelOwner: comment?.comment?.author_is_channel_owner,
      creatorReplied: comment?.comment_replies_data?.has_channel_owner_replied,
      creatorReplyThumbnail: comment?.comment_replies_data?.view_replies_creator_thumbnail?.map(
        thumbnail => {
          return {
            url: thumbnail.url,
            width: thumbnail.width,
            height: thumbnail.height
          };
        }
      )
    };
  });
};
