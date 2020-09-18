export const state = () => ({
  env: {}
});
export const getters = {
  apiUrl(state) {
    return state.env.apiUrl;
  }
};
