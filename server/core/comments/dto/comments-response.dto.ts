import { CommentDto } from './comment.dto';

export class CommentsResponseDto {
  comments: Array<CommentDto>;
  continuation: string;
}
