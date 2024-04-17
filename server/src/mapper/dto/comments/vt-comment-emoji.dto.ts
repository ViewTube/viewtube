import type { VTThumbnailDto } from '../vt-thumbnail.dto';

export class VTCommentEmojiDto {
  name: string;
  shortcuts: string[];
  thumbnails: Array<VTThumbnailDto>;
}
