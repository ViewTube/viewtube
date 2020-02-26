export default {
  namespaced: true,
  state: {
    currentVideo: null,
    startTime: 0
  },
  getters: {
    currentVideo: (state) => state.currentVideo,
    startTime: (state) => state.startTime
  },
  mutations: {
    setCurrentVideo(state, video) {
      state.currentVideo = video
    },
    setStartTime(state, startTime) {
      state.startTime = startTime
    }
  }
}
