import type { VTThumbnailDto } from './vt-thumbnail.dto';

export class VTAuthorDto {
  id: string;
  name: string;
  thumbnails?: Array<VTThumbnailDto>;
  isVerified?: boolean;
  isArtist?: boolean;
  handle?: string;
  subscriberCount?: number;
}
