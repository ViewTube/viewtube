import { VTCommentEmojiDto } from './vt-comment-emoji.dto';

export class VTCommentsHeaderDto {
  commentsCount: number;
  customEmojis: Array<VTCommentEmojiDto>;
}
