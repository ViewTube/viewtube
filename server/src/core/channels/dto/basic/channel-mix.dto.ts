import { ChannelMix } from '../../types/ytch.types';
import { ChannelImageDto } from './channel-image.dto';

export class ChannelMixDto implements ChannelMix {
  playlistId: string;
  title: string;
  description: string;
  videoCount: number;
  url: string;
  thumbnails: ChannelImageDto[];
}
