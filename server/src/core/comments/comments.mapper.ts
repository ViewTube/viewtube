import { CommentDto } from './dto/comment.dto';
import { CommentsResponseDto } from '../../mapper/converter/comments/vt-comments-response.dto';

export const mapComments = (input: any): CommentsResponseDto => {
  return {
    comments: input.comments.map(
      (comment: any): CommentDto => ({
        authorThumbnails: comment.authorThumb,
        author: comment.author,
        authorId: comment.authorId,
        creatorHeart: comment.isHearted,
        isEdited: comment.edited,
        likeCount: comment.likes,
        publishedText: comment.time,
        replyCount: comment.numReplies,
        replyToken: comment.replyToken,
        content: comment.text
      })
    ),
    continuation: input.continuation
  };
};
