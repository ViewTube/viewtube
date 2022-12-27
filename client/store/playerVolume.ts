import { defineStore } from 'pinia';

export const usePlayerVolumeStore = defineStore('playerVolume', {
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
