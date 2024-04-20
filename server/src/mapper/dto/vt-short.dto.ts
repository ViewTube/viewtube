import { VTThumbnailDto } from './vt-thumbnail.dto';

export class VTShortDto {
  type: 'short';
  id: string;
  title: string;
  thumbnails?: Array<VTThumbnailDto>;
  viewCount?: number;
  duration?: {
    text: string;
    seconds: number;
  };
}
