import { PlaylistImageDto } from './playlist-image.dto';
import { PlaylistItemDto } from './playlist-item.dto';

type VisibilityType = 'unlisted' | 'everyone';

export class PlaylistResultDto {
  id: string;
  url: string;
  title: string;
  estimatedItemCount: number;
  views: number;
  thumbnails: PlaylistImageDto[];
  bestThumbnail: PlaylistImageDto;
  lastUpdated: string;
  description: string | null;
  visibility: VisibilityType;
  author: {
    name: string;
    url: string;
    avatars: PlaylistImageDto[];
    bestAvatar: PlaylistImageDto;
    channelID: string;
  };
  items: PlaylistItemDto[];

  continuation: any | null;
}
