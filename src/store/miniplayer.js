export default {
  namespaced: true,
  state: {
    currentVideo: null,
    startTime: 0
  },
  getters: {
    currentVideo(state, video) {
      state.currentVideo = video
    },
    startTime(state, startTime) {
      state.startTime = startTime
    }
  }
}
