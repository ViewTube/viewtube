export const state = () => ({
  currentVideo: null,
  startTime: 0
});
export const getters = {
  currentVideo: state => state.currentVideo,
  startTime: state => state.startTime
};
export const mutations = {
  setCurrentVideo(state, video) {
    state.currentVideo = video;
  },
  setStartTime(state, startTime) {
    state.startTime = startTime;
  }
};
