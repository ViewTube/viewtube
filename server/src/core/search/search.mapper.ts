/* eslint-disable no-case-declarations */
import { generateVideoThumbnails } from 'server/mapper/utils/video-thumbnails';
import { Result, Video, Channel, Playlist, Item, Shelf } from 'ytsr';
import { Common } from '../common';
import { SearchResponse } from './interface/search-response.interface';

export class SearchMapper {
  static ytsrToDto(ytsrResult: Result): SearchResponse {
    const items = this.getItems(ytsrResult);
    delete ytsrResult.items;
    const result: SearchResponse = {
      ...ytsrResult,
      items
    };
    return result;
  }

  private static getItems(source: Result) {
    const result = [];
    source.items.forEach((source: Item, index: number) => {
      switch (source.type) {
        case 'channel':
          const channel = { ...this.mapChannel(source), ...{ position: index } };
          result.push(channel);
          break;
        case 'video':
          const video = { ...this.mapVideo(source), ...{ position: index } };
          result.push(video);
          break;
        case 'playlist':
          const playlist = { ...this.mapPlaylist(source), ...{ position: index } };
          result.push(playlist);
          break;
        case 'shelf':
          const shelf = { ...this.mapShelf(source), ...{ position: index } };
          result.push(shelf);
          break;
        case 'movie':
          const movie = { ...source, ...{ position: index } };
          result.push(movie);
          break;
      }
    });
    return result;
  }

  static mapShelf(source: Shelf): any {
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
      videoThumbnails: generateVideoThumbnails(Common.getVideoIdFromUrl(source.url)),
      viewCount: source.views,
      live: source.isLive,
      lengthString: source.duration
    };
    return video;
  }
}
