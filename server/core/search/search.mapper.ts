import { Result } from 'ytsr';
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

      items: ytsrResult.items.map(source => {
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
          case 'mix' ||
            'movie' ||
            'playlist' ||
            'search-refinements' ||
            'shelf-compact' ||
            'shelf-vertical':
            return source;
        }
      })
    };
    return resultDto;
  }
}
