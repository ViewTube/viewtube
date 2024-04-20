import { VTThumbnailDto } from '../vt-thumbnail.dto';

export class VTEndscreenElementDto {
  position: {
    left: number;
    top: number;
  };
  dimensions: {
    width: number;
    aspectRatio: number;
  };
  startMs: number;
  endMs: number;
  thumbnails: Array<VTThumbnailDto>;
}
