// import Commons from '@/plugins/commons.ts';
import axios from 'axios';
import { createApi } from '@/plugins/apiCreator';

export default class {
  constructor(invidiousUrl: string) {
    if (!invidiousUrl.endsWith('/')) invidiousUrl += '/';
    this.apiPrototype.request = axios.create({
      baseURL: `${invidiousUrl}`,
      timeout: 30000
    });
    this.api = createApi(this.apiPrototype);
  }

  api: any = {};

  apiPrototype = {
    request: {},
    requests: {
      popular: {
        url: 'v1/popular',
        fields: [
          'type',
          'title',
          'videoId',
          'videoThumbnails',
          'lengthSeconds',
          'viewCount',
          'author',
          'authorId',
          'publishedText'
        ]
      },
      stats: {
        url: 'v1/stats'
      },
      comments: {
        url: 'v1/comments',
        fields: ['title']
      },
      manifest: {
        url: 'manifest/dash/id',
        fields: ['title']
      },
      channels: {
        url: 'v1/channels',
        fields: [
          'author',
          'authorId',
          'authorBanners',
          'authorThumbnails',
          'subCount',
          'totalViews',
          'joined',
          'paid',
          'isFamilyFriendly',
          'descriptionHtml',
          'description',
          'latestVideos',
          'relatedChannels'
        ]
      },
      videos: {
        url: 'v1/videos',
        fields: [
          'type',
          'title',
          'videoId',
          'videoThumbnails',
          'storyboards',
          'description',
          'descriptionHtml',
          'publishedText',
          'viewCount',
          'likeCount',
          'dislikeCount',
          'paid',
          'premium',
          'isFamilyFriendly',
          'author',
          'authorId',
          'authorThumbnails',
          'subCountText',
          'lengthSeconds',
          'rating',
          'formatStreams',
          'recommendedVideos'
        ]
      },
      search: {
        url: 'v1/search',
        fields: [
          'type',
          'title',
          'videoId',
          'videoThumbnails',
          'lengthSeconds',
          'viewCount',
          'author',
          'authorId',
          'publishedText',
          'videos',
          'videoCount',
          'description'
        ]
      },
      storyboards: {
        url: 'v1/storyboards'
      }
    }
  };
}
