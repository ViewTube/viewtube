import { defineStore } from 'pinia';
import { insertSetters } from '@/utilities/storeSetters';

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
