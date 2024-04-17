import type { Playlist } from '../../yt-channel-info/app/types';

export class ChannelPlaylistDto implements Playlist {
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
