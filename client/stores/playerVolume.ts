import { defineStore } from 'pinia';

export const useStore = defineStore('playerVolume', {
  state: () => ({
    playerVolume: 1
  }),
  actions: {
    setPlayerVolume(volume: number) {
      if (volume >= 0 && volume <= 1) {
        this.playerVolume = volume;
      }
    }
  }
});
