import { VTThumbnailDto } from '../vt-thumbnail.dto';

export class VTCommentEmojiDto {
  name: string;
  shortcut: string;
  thumbnails: Array<VTThumbnailDto>;
}
