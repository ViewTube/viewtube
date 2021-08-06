import { getterTree, mutationTree } from 'typed-vuex';

export const state = () => ({
  loop: false,
  resolutions: null as []
});

export const getters = getterTree(state, {
  loop: state => state.loop,
  resolutions: state => state.resolutions
});

export const mutations = mutationTree(state, {
  setLoop: (state, enabled) => (state.loop = enabled),
  setResolutions: (state, resolutions) => (state.resolutions = resolutions)
});
