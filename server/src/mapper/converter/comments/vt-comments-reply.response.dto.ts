import { VTCommentDto } from 'server/mapper/dto/comments/vt-comment.dto';

export class VTCommentsReplyResponseDto {
  comments: Array<VTCommentDto>;
  continuation?: string;
}
