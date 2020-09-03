import Commons from '@/plugins/commons.js'
import axios from 'axios'
import { createApi } from '@/plugins/apiCreator'

const invidiousPrototype = {
  request: axios.create({
    baseURL: Commons.getApiUrlNoVersion(),
    timeout: 10000
  }),
  api: {},
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
      fields: [
        'title'
      ]
    },
    manifest: {
      url: 'manifest/dash/id',
      fields: [
        'title'
      ]
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
}

const invidious = createApi(invidiousPrototype)

export default invidious
