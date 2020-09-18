import axios from 'axios';
// import Commons from '@/plugins/commons.js';
import { createApi } from '@/plugins/apiCreator';

const apiPrototype = {
  request: axios.create({
    baseURL: this.$store.getters['environment/apiUrl'],
    timeout: 10000
  }),
  api: {},
  requests: {
    search: {
      url: 'search'
    },
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
};

const ViewtubeApi = createApi(apiPrototype);

export default ViewtubeApi;
