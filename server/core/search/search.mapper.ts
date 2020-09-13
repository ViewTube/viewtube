import { Result, Video, Channel, Playlist, Item } from 'ytsr';
import { ISearchResponse } from './interface/search-response.interface';
import { Common } from '../common';

export class SearchMapper {
  static ytsrToDto(ytsrResult: Result): ISearchResponse {
    const resultDto: ISearchResponse = {
      currentRef: ytsrResult.currentRef,
      filters: ytsrResult.filters,
      nextpageRef: ytsrResult.nextpageRef,
      query: ytsrResult.query,
      results: ytsrResult.results,

      // Filter Mixes, because urls are broken
      items: this.getItems(ytsrResult.items.filter(el => el.type !== 'mix'))
    };
    return resultDto;
  }

  private static getItems(source) {
    const result = {
      channels: [],
      videos: [],
      movies: [],
      playlists: [],
      verticalShelf: [],
      compactShelf: [],
      searchRefinements: []
    };
    source.forEach((source: Item, index: number) => {
      switch (source.type) {
        case 'channel':
          const channel = { ...this.mapChannel(source), ...{ position: index } };
          result.channels.push(channel);
          break;
        case 'video':
          const video = { ...this.mapVideo(source), ...{ position: index } };
          result.videos.push(video);
          break;
        case 'playlist':
          const playlist = { ...this.mapPlaylist(source), ...{ position: index } };
          result.playlists.push(playlist);
          break;
        case 'shelf-vertical':
          result.verticalShelf.push({
            type: 'shelf-vertical',
            title: source.title,
            items: source.items.map(this.mapVideo),
            position: index
          });
          break;
        case 'search-refinements':
          result.searchRefinements.push({
            entries: (source as any).entries,
            position: index
          });
          break;
        case 'shelf-compact':
          const compactShelf = { ...source, ...{ position: index } };
          result.compactShelf.push(compactShelf);
          break;
        case 'movie':
          const movie = { ...source, ...{ position: index } };
          result.movies.push(movie);
          break;
      }
    });
    return result;
  }

  static mapPlaylist(source: Playlist): any {
    const playlist = {
      type: 'playlist',
      title: source.title,
      playlistId: Common.getPlaylistIdFromUrl(source.link),
      author: source.author.name,
      authorId: Common.getChannelIdFromUrl(source.author.ref),
      authorVerified: source.author.verified,
      thumbnail: source.thumbnail,
      videoCountString: source.length
    };
    return playlist;
  }

  static mapChannel(source: Channel): any {
    const channel = {
      type: 'channel',
      author: source.name,
      authorId: source.channel_id,
      authorThumbnails: Common.getAuthorThumbnails(source.avatar),
      authorVerified: source.verified,
      authorUrl: '/channel/' + source.channel_id,
      description: source.description_short,
      subCount: source.followers,
      videoCount: source.videos
    };
    return channel;
  }

  static mapVideo(source: Video): any {
    const video = {
      type: 'video',
      title: source.title,
      author: source.author.name,
      authorId: source.author.ref,
      description: source.description,
      publishedText: source.uploaded_at,
      videoId: Common.getVideoIdFromUrl(source.link),
      videoThumbnails: Common.getVideoThumbnails(Common.getVideoIdFromUrl(source.link)),
      viewCount: source.views,
      live: source.live,
      lengthString: source.duration
    };
    return video;
  }
}
