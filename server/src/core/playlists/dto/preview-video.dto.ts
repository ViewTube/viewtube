import type { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';

export class PreviewVideoDto {
  title?: string;
  videoId?: string;
  videoThumbnails: Array<VTThumbnailDto>;
}
