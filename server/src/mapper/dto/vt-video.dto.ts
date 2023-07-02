import { VTThumbnailDto } from './vt-thumbnail.dto';

export class VTVideoDto {
  id: string;
  title: string;
  author?: {
    id: string;
    name: string;
    thumbnails?: Array<VTThumbnailDto>;
    isVerified?: boolean;
    isArtist?: boolean;
    handle?: string;
  };
  description?: string;
  thumbnails?: Array<VTThumbnailDto>;
  richThumbnails?: Array<VTThumbnailDto>;
  duration?: {
    text: string;
    seconds: number;
  };
  published?: {
    date?: Date;
    text?: string;
  };
  viewCount?: number;
  upcoming?: Date;
  live?: boolean;
}
