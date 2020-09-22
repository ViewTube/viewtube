export const state = () => ({
  env: {}
});
export const getters = {
  apiUrl(state) {
    if (process.server) {
      return `http://${state.env.host}:${state.env.port}/api/`;
    }
    return state.env.apiUrl;
  }
};
