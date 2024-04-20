import { VTThumbnailDto } from './vt-thumbnail.dto';

export class VTChannelDto {
  id: string;
  name: string;
  handle?: string;
  thumbnails?: Array<VTThumbnailDto>;
  isVerified?: boolean;
  isArtist?: boolean;
  subscribers?: number;
  description?: string;
  videoCount?: number;
}
