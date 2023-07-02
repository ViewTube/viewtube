import { VTThumbnailDto } from './vt-thumbnail.dto';

export class VTChapterDto {
  title: string;
  startMs: number;
  thumbnails: Array<VTThumbnailDto>;
}
