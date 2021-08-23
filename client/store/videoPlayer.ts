import { getterTree, mutationTree } from 'typed-vuex';

export const state = () => ({
  loop: false,
  currentTime: 0,
  videoLength: 0
});

export const getters = getterTree(state, {
  loop: state => state.loop,
  currentTime: state => state.currentTime,
  videoLength: state => state.videoLength
});

export const mutations = mutationTree(state, {
  setLoop: (state, enabled: boolean) => (state.loop = enabled),
  setCurrentTime: (state, time: number) => (state.currentTime = time),
  setVideoLength: (state, length: number) => (state.videoLength = length)
});
