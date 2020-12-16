/* eslint-disable no-case-declarations */
import { Result, Video, Channel, Playlist, Item, Shelf } from 'ytsr';
import { Common } from '../common';
import { ISearchResponse } from './interface/search-response.interface';

export class SearchMapper {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static ytsrToDto(ytsrResult: Result): ISearchResponse {
    // const resultDto: ISearchResponse = {
    //   // currentRef: ytsrResult.currentRef,
    //   activeFilters: ytsrResult.activeFilters,
    //   // ne: ytsrResult.continuation,
    //   // query: ytsrResult.originalQuery,
    //   results: ytsrResult.results,

    //   // Filter Mixes, because urls are broken
    //   items: this.getItems(ytsrResult.items.filter(el => el.type !== 'mix'))
    // };
    return null;
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
        case 'shelf':
          const verticalShelf = { ...this.mapVerticalShelf(source), ...{ position: index } };
          result.verticalShelf.push(verticalShelf);
          break;
        // case 'search-refinements':
        //   result.searchRefinements.push({
        //     entries: (source as any).entries,
        //     position: index
        //   });
        // break;
        // case 'shelf-compact':
        //   const compactShelf = { ...source, ...{ position: index } };
        //   result.compactShelf.push(compactShelf);
        //   break;
        case 'movie':
          const movie = { ...source, ...{ position: index } };
          result.movies.push(movie);
          break;
      }
    });
    return result;
  }

  static mapVerticalShelf(source: Shelf): any {
    let shelfType = 'general';
    if (source.title.match(/latest from/gi)) {
      shelfType = 'channel';
    }
    return {
      type: 'shelf-vertical',
      shelfType,
      title: source.title,
      items: source.items.map(this.mapVideo)
    };
  }

  static mapPlaylist(source: Playlist): any {
    const playlist = {
      type: 'playlist',
      title: source.title,
      playlistId: Common.getPlaylistIdFromUrl(source.url),
      author: source.owner.name,
      authorId: source.owner.channelID,
      authorVerified: source.owner.verified,
      thumbnail: source.firstVideo.bestThumbnail,
      videoCountString: source.length
    };
    return playlist;
  }

  static mapChannel(source: Channel): any {
    const channel = {
      type: 'channel',
      author: source.name,
      authorId: source.channelID,
      authorThumbnails: Common.getAuthorThumbnails(source.avatars[0].url),
      authorVerified: source.verified,
      authorUrl: '/channel/' + source.channelID,
      description: source.descriptionShort,
      subCount: source.subscribers,
      videoCount: source.videos
    };
    return channel;
  }

  static mapVideo(source: Video): any {
    const video = {
      type: 'video',
      title: source.title,
      author: source.author.name,
      authorId: source.author.channelID,
      description: source.description,
      publishedText: source.uploadedAt,
      videoId: Common.getVideoIdFromUrl(source.url),
      videoThumbnails: Common.getVideoThumbnails(Common.getVideoIdFromUrl(source.url)),
      viewCount: source.views,
      live: source.isLive,
      lengthString: source.duration
    };
    return video;
  }
}
