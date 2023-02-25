import { AuthorThumbnailDto } from './author-thumbnail.dto';
import { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';

export class RecommendedVideoDto {
  videoId: string;
  title: string;
  videoThumbnails: Array<VTThumbnailDto>;
  author: string;
  authorUrl: string;
  authorId: string;
  authorThumbnails: Array<AuthorThumbnailDto>;
  lengthSeconds: number;
  viewCountText: string;
  viewCount: number;
}
