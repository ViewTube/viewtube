import type { Video } from '../../yt-channel-info/app/types';
import type { ChannelImageDto } from './channel-image.dto';

export class ChannelVideoDto implements Video {
  author: string;
  authorId: string;
  durationText?: string;
  lengthSeconds?: number;
  liveNow: boolean;
  premiere: boolean;
  premium: boolean;
  publishedText: string;
  title: string;
  type: 'video';
  videoId: string;
  videoThumbnails: ChannelImageDto[] | null;
  viewCount: number;
  viewCountText: string;
}
