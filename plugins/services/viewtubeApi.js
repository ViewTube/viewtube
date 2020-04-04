// https://api.viewtube.eu/videos?id=mQLzOuwDu_8
import Commons from '@/plugins/commons.js'
import axios from 'axios'
import { createApi } from '@/plugins/apiCreator'

const apiPrototype = {
  request: axios.create({
    baseURL: Commons.getOwnApiUrl(),
    timeout: 10000
  }),
  api: {},
  requests: {
    videos: {
      url: 'videos',
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
    }
  }
}

const viewtubeApi = createApi(apiPrototype)

export default viewtubeApi
