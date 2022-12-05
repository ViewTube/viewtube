import { ChannelHomeResponse } from '../../types/ytch.types';
import { ChannelMixDto } from '../basic/channel-mix.dto';
import { ChannelPlaylistDto } from '../basic/channel-playlist.dto';
import { ChannelVideoDto } from '../basic/channel-video.dto';
import { RelatedChannelDto } from '../basic/related-channel.dto';

export class ChannelHomeDto implements ChannelHomeResponse {
  featuredVideo: ChannelVideoDto;
  items: {
    shelfName: string;
    type: 'channels' | 'videos' | 'verticalVideoList' | 'playlist' | 'mix' | 'playlists' | 'video';
    items: ChannelVideoDto[] | RelatedChannelDto[] | ChannelPlaylistDto[] | ChannelMixDto;
  };
}
