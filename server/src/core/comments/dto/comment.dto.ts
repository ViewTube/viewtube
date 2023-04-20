import { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';

export class CommentDto {
  authorThumbnails: Array<VTThumbnailDto>;
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
