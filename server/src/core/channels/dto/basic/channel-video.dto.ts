import { ChannelVideo } from '../../types/ytch.types';
import { ChannelImageDto } from './channel-image.dto';

export class ChannelVideoDto implements ChannelVideo {
  author: string;
  authorId: string;
  durationText: string;
  lengthSeconds: number;
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
