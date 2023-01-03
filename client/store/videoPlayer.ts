import { defineStore } from 'pinia';

const state = {
  loop: false,
  currentTime: 0,
  videoLength: 0
};

export const useVideoPlayerStore = defineStore('videoPlayer', {
  state: () => state,
  actions: {
    ...insertSetters(state)
  }
});
