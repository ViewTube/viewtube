import { Result } from 'ytsr';
import { ISearchResponse } from './interface/search-response.interface';
import { Common } from '../common';
import { basename } from 'path';

export class SearchMapper {
  static ytsrToDto(ytsrResult: Result): ISearchResponse {
    const resultDto: ISearchResponse = {
      currentRef: ytsrResult.currentRef,
      filters: ytsrResult.filters,
      nextpageRef: ytsrResult.nextpageRef,
      query: ytsrResult.query,
      results: ytsrResult.results,

      // Filter Mixes, because urls are broken
      items: ytsrResult.items
        .filter(el => el.type !== 'mix')
        .map(source => {
          switch (source.type) {
            case 'channel':
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
            case 'video':
              return this.mapVideo(source);
            case 'playlist':
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
            case 'shelf-vertical':
              const verticalShelf = {
                type: 'shelf-vertical',
                title: source.title,
                items: source.items.map(this.mapVideo)
              };
              return verticalShelf;
            default:
              return source;
          }
        })
    };
    return resultDto;
  }

  static mapVideo(source) {
    const video = {
      type: 'video',
      title: source.title,
      author: source.author.name,
      authorId: source.author.ref,
      description: source.description,
      publishedText: source.uploaded_at,
      videoId: Common.getVideoIdFromUrl(source.link),
      videoThumbnails: Common.getVideoThumbnails(source.thumbnail),
      viewCount: source.views,
      live: source.live,
      lengthString: source.duration
    };
    return video;
  }
}
