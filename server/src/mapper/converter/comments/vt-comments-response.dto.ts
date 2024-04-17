import type { VTCommentDto } from 'server/mapper/dto/comments/vt-comment.dto';
import type { VTCommentsHeaderDto } from 'server/mapper/dto/comments/vt-comments-header.dto';

export class VTCommentsResponseDto {
  comments: Array<VTCommentDto>;
  header: VTCommentsHeaderDto;
  continuation?: string;
}
