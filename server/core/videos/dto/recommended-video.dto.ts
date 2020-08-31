import { VideoThumbnailDto } from "./video-thumbnail.dto";
import { AuthorThumbnailDto } from "./author-thumbnail.dto";

export class RecommendedVideoDto {
  videoId: string;
  title: string;
  videoThumbnails: Array<VideoThumbnailDto>;
  author: string;
  authorUrl: string;
  authorId: string;
  authorThumbnails: Array<AuthorThumbnailDto>;
  lengthSeconds: number;
  viewCountText: string;
  viewCount: number;
}