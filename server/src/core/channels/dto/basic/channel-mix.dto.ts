import type { Mix } from '../../yt-channel-info/app/types';
import type { ChannelImageDto } from './channel-image.dto';

export class ChannelMixDto implements Mix {
  playlistId: string;
  title: string;
  description: string;
  videoCount: number;
  url: string;
  thumbnails: ChannelImageDto[];
}
