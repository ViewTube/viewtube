import { YT } from 'youtubei.js';
import { getHandleFromUrl } from 'server/mapper/utils/handle';
import { parseRelativeTime } from 'server/mapper/utils/parse-relative-time';
import { VTSearchVideoResultDto } from 'server/mapper/dto/search/vt-search-video-result.dto';
import { VTSearchChannelResultDto } from 'server/mapper/dto/search/vt-search-channel-result.dto';
import { fixUrl } from 'server/mapper/utils/fix-url';
import { VTSearchShelfDto } from 'server/mapper/dto/search/vt-search-shelf.dto';
import { VTShortsShelfDto } from 'server/mapper/dto/search/vt-shorts-shelf.dto';
import { VTShortDto } from 'server/mapper/dto/vt-short.dto';
import { parseShortenedNumber } from 'server/mapper/utils/shortened-number';
import { parseAccessibilityDuration } from 'server/mapper/utils/accessibility-duration';
import { getTimestampFromSeconds } from 'viewtube/shared';
import { VTSearchPlaylistDto } from 'server/mapper/dto/search/vt-search-playlist.dto';
import { VTSearchMovieDto } from 'server/mapper/dto/search/vt-search-movie.dto';
import { logger } from 'server/common/logger';
import { VTCommentDto } from 'server/mapper/dto/comments/vt-comment.dto';
import { Comment, CommentView } from 'youtubei.js/dist/src/parser/nodes';

export const extractComments = (comments: YT.Comments): Array<VTCommentDto> => {
  return comments?.contents?.map(comment => {
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
