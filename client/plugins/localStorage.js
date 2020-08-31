import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  createPersistedState({
    key: 'viewtube',
    paths: [
      'instances',
      'settings',
      'videoProgress'
    ],
    fetchBeforeUse: true
  })(store)
}
