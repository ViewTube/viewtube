import type { VTThumbnailDto } from '../vt-thumbnail.dto';

export class VTSimpleCardContentDto {
  type: 'simple';
  title: string;
  thumbnails: Array<VTThumbnailDto>;
  displayDomain: string;
  url: string;
}
