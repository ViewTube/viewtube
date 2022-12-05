import { ChannelPlaylist } from '../../types/ytch.types';

export class ChannelPlaylistDto implements ChannelPlaylist {
  author: string;
  authorId: string;
  authorUrl: string;
  playlistId: string;
  playlistThumbnail: string;
  playlistUrl: string;
  title: string;
  type: 'playlist';
  videoCount: number;
}
