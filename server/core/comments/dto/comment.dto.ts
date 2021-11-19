import { AuthorThumbnailDto } from 'viewtube/shared';

export class CommentDto {
  authorThumbnails: Array<AuthorThumbnailDto>;
  author: string;
  authorId: string;
  publishedText: string;
  isEdited: boolean;
  likeCount: number;
  creatorHeart: boolean;
  replyToken: string;
  replyCount: number;
  content: string;
}
