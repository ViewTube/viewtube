import { getterTree, mutationTree } from 'nuxt-typed-vuex';

export const state = () => ({
  currentVideo: null as [],
  startTime: 0 as number
});

export const getters = getterTree(state, {
  currentVideo: state => state.currentVideo,
  startTime: state => state.startTime
});

export const mutations = mutationTree(state, {
  setCurrentVideo(state, video) {
    state.currentVideo = video;
  },
  setStartTime(state, startTime) {
    state.startTime = startTime;
  }
});
