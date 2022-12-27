import { ChannelImage } from '../../types/ytch.types';

export class ChannelImageDto implements ChannelImage {
  url: string;
  width: number;
  height: number;
}
