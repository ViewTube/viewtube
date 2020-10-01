import { getterTree, mutationTree } from 'nuxt-typed-vuex';

export const state = () => ({
  savedVideoProgress: {}
});

export const getters = getterTree(state, {
  getSavedPositionForId: state => (videoId: number) => {
    if (videoId && process.browser && state.savedVideoProgress[videoId]) {
      return parseInt(state.savedVideoProgress[videoId]);
      // return await this.$localforage.getItem(`savedVideoPositionId${videoId}`) || 0
    }
    return 0;
  }
});

export const mutations = mutationTree(state, {
  addVideoProgress(state, videoProgress: { videoId: number; value: string }) {
    if (videoProgress.videoId && process.browser) {
      state.savedVideoProgress[videoProgress.videoId] = videoProgress.value;
    }
  }
});
