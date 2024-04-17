import type { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';

export class ChannelBasicInfoDto {
  authorId: string;
  author: string;
  authorUrl?: string;
  authorThumbnails?: Array<VTThumbnailDto>;
  authorThumbnailUrl?: string;
  authorVerified?: boolean;
  subCount?: number;
  videoCount?: number;
  description?: string;
}
