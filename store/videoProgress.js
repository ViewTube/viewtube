export default {
  getSavedPosition (videoId) {
    if (videoId) {
      return parseInt(localStorage.getItem(`savedVideoPositionId${videoId}`)) || 0
      // return await this.$localforage.getItem(`savedVideoPositionId${videoId}`) || 0
    }
    return 0
  },
  setSavedPosition (value, videoId) {
    if (videoId) {
      return localStorage.setItem(`savedVideoPositionId${videoId}`, value)
      // return this.$localforage.setItem(`savedVideoPositionId${videoId}`, value)
    }
    return 0
  }
}
