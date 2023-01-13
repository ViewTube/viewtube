import { defineStore } from 'pinia';

export const useMiniplayerStore = defineStore('miniplayer', {
  state: () => ({
    currentVideo: null,
    startTime: 0
  }),

  actions: {
    setCurrentVideo(video: any) {
      this.currentVideo = video;
    },
    setStartTime(startTime: number) {
      this.startTime = startTime;
    }
  }
});
