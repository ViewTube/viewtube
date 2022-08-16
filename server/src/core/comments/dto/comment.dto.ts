import { AuthorThumbnailDto } from 'server/core/videos/dto/author-thumbnail.dto';

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
