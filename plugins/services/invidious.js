import Commons from '@/plugins/commons.js'
import axios from 'axios'

const invidious = {
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
        'formatStreams'
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

Object.entries(invidious.requests).forEach(el => {
  invidious.api[el[0]] = async function (args = {}) {
    let url = el[1].url
    if (args.id) {
      url += `/${args.id}`
      delete args.id
    }
    if (el[1].fields) {
      if (!args.params) {
        args.params = {}
      }
      args.params.fields = el[1].fields.toString()
    }
    return invidious.request.get(url, args).catch((error) => {
      // store.dispatch('createMessage', {
      //   type: 'error',
      //   title: 'Error loading page',
      //   message: `Try<br/>
      //                   <ul><li>Checking your internet connection</li>
      //                   <li>Switching to another instance in settings</li></ul>`,
      //   dismissDelay: 0
      // })
      console.error(error)
    })
  }
})

export default invidious
