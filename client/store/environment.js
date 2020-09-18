export const state = () => ({
  apiUrl: process.env.apiUrl,
  vapidKey: process.env.vapidKey,
  nodeEnv: process.env.NODE_ENV
});
export const getters = {
  apiUrl(state) {
    return state.apiUrl;
  }
};
export const mutations = {};
export const actions = {};
