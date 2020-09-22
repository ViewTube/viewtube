export const state = () => ({
  env: {}
});
export const getters = {
  apiUrl(state) {
    if (process.server) {
      return `http://${state.env.host}:${state.env.port}/`;
    }
    return state.env.apiUrl;
  }
};
