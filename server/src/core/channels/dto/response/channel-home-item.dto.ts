import { ChannelMixDto } from '../basic/channel-mix.dto';
import { ChannelPlaylistDto } from '../basic/channel-playlist.dto';
import { ChannelVideoDto } from '../basic/channel-video.dto';
import { RelatedChannelDto } from '../basic/related-channel.dto';

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
