export default {
  state: {
    theme: 'default',
    defaults: {
      theme: [
        { value: 'default', name: 'Dark Theme' },
        { value: 'light', name: 'Light Theme' },
        { value: 'dark-no-gradient', name: 'Dark Theme without background gradients' },
        { value: 'black', name: 'Black Theme' }
      ]
    }
  },
  getters: {
    theme(state) {
      return state.theme
    },
    defaultThemes(state) {
      return state.defaults.theme
    }
  },
  mutations: {
    setTheme(state, theme) {
      if (state.defaults.theme.find(e => e.value === theme)) {
        state.theme = theme
      }
    }
  }
}
