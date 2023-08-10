import { Image } from '../../yt-channel-info/app/types';

export class ChannelImageDto implements Image {
  url: string;
  width: number;
  height: number;
}
