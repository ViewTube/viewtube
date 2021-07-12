export const state = () => ({
  theme: 'default',
  miniplayer: true
});
export const getters = {
  theme: state => state.theme,
  miniplayer: state => state.miniplayer
};
export const mutations = {
  setTheme(state, theme) {
    if (state.defaults.theme.find(e => e.value === theme)) {
      state.theme = theme;
    }
  },
  setMiniplayer(state, enabled) {
    state.miniplayer = enabled;
  }
};
