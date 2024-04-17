import type { VTAuthorDto } from '../vt-author.dto';
import type { VTThumbnailDto } from '../vt-thumbnail.dto';

export class VTCommentDto {
  id: string;
  content: string;
  pinned?: boolean;
  creatorHeart?: boolean;
  likeCount: number;
  replyCount: number;
  hasReplies?: boolean;
  isEdited?: boolean;
  replyContinuation?: string;
  creatorReplied?: boolean;
  creatorReplyThumbnail?: Array<VTThumbnailDto>;
  channelOwner?: boolean;
  channelMember?: boolean;
  published: {
    date: Date;
    text: string;
  };
  author: VTAuthorDto;
}
