import type { ChannelMixDto } from '../basic/channel-mix.dto';
import type { ChannelPlaylistDto } from '../basic/channel-playlist.dto';
import type { ChannelVideoDto } from '../basic/channel-video.dto';
import type { RelatedChannelDto } from '../basic/related-channel.dto';

export class ChannelHomeItemDto {
  shelfName: string;
  type:
    | 'channels'
    | 'videos'
    | 'verticalVideoList'
    | 'playlist'
    | 'mix'
    | 'playlists'
    | 'video'
    | 'livestreams';
  items: ChannelVideoDto[] | RelatedChannelDto[] | ChannelPlaylistDto[] | ChannelMixDto[];
}
