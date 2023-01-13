import { PlaylistImageDto } from './playlist-image.dto';

export class PlaylistItemDto {
  title: string;
  index: number;
  id: string;
  shortUrl: string;
  url: string;
  author: {
    name: string;
    url: string;
    channelID: string;
  };
  thumbnails: PlaylistImageDto[];
  bestThumbnail: PlaylistImageDto;
  isLive: boolean;
  duration: string | null;
  durationSec: number | null;
}
