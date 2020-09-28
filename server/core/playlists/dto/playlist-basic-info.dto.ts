import { VideoThumbnailDto } from 'server/core/videos/dto/video-thumbnail.dto';

export class PlaylistBasicInfoDto {
  title: string;
  playlistId: string;
  playlistVideoLink: string;
  playlistLink: string;
  author: string;
  authorId: string;
  authorUrl?: string;
  videoCount: number;
  firstVideoId?: string;
  playlistThumbnails?: Array<VideoThumbnailDto>;
  previewVideos?: Array<{
    title?: string;
    videoId?: string;
    videoThumbnails: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  }>;
}
