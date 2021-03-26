import { getterTree, mutationTree } from 'nuxt-typed-vuex';

export const state = () => ({
  playerVolume: 1
});

export const getters = getterTree(state, {
  getPlayerVolume: state => state.playerVolume
});

export const mutations = mutationTree(state, {
  setPlayerVolume: (state, volume) => {
    if (volume >= 0 && volume <= 1) {
      state.playerVolume = volume;
    }
  }
});
