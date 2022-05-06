import { AuthorThumbnailDto } from 'viewtube/shared/dto/video/author-thumbnail.dto';

export class ChannelBasicInfoDto {
  authorId: string;
  author: string;
  authorUrl?: string;
  authorThumbnails?: Array<AuthorThumbnailDto>;
  authorThumbnailUrl?: string;
  authorVerified?: boolean;
  subCount?: number;
  videoCount?: number;
  description?: string;
}
