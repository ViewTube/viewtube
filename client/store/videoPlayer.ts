import { getterTree, mutationTree } from 'nuxt-typed-vuex';

export const state = () => ({
  resolutions: null as []
});

export const getters = getterTree(state, {
  resolutions: state => state.resolutions
});

export const mutations = mutationTree(state, {
  setResolutions: (state, resolutions) => (state.resolutions = resolutions)
});
