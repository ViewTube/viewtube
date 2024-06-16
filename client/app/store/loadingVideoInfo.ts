import { defineStore } from 'pinia';

export const useLoadingVideoInfoStore = defineStore('loadingVideoInfo', {
  state: () => ({
    video: null
  }),
  actions: {
    setLoadingVideoInfo(videoInfo) {
      this.video = videoInfo;
    },
    clearInfo() {
      this.video = null;
    }
  }
});
