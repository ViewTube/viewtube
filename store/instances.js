export const state = () => ({
  currentInstance: 'https://invidious.snopyta.org',
  instances: [
    'https://invidious.snopyta.org',
    'https://invidio.us',
    'https://invidiou.sh',
    'https://invidious.ggc-project.de',
    'https://yewtu.be',
    'https://invidious.toot.koeln'
  ]
})
export const getters = {
  currentInstance(state) {
    return state.currentInstance
  },
  instances(state) {
    return state.instances
  }
}
export const mutations = {
  changeInstance(state, instance) {
    state.currentInstance = instance
  }
}
