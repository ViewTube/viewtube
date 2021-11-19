import axios from 'axios';
// import { commons } from '@/plugins/commons';
import { createApi } from '@/plugins/apiCreator';

export default class {
  constructor(apiUrl: string) {
    this.apiPrototype.request = axios.create({
      baseURL: apiUrl,
      timeout: 30000
    });
    this.api = createApi(this.apiPrototype);
  }

  api: any = {};

  apiPrototype = {
    request: {},
    requests: {
      popular: {
        url: 'homepage/popular'
      },
      channels: {
        url: 'channels'
      },
      videos: {
        url: 'videos'
      }
    }
  };
}
