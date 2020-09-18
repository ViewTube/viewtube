import Axios from 'axios';
// import Commons from '@/plugins/commons';

export const state = () => ({
  username: null
});
export const getters = {
  username: state => state.username,
  isLoggedIn: state => Boolean(state.username)
};
export const mutations = {
  setUsername(state, username) {
    state.username = username;
  }
};
export const actions = {
  getUser({ getters, commit, rootState }) {
    console.log('getting user...');
    this.$axios
      .get(`${rootState.environment.env.apiUrl}user/profile`, {
        withCredentials: true
      })
      .then(result => {
        commit('setUsername', result.data.username);
      });
  },
  logout({ commit, rootState }) {
    return this.$axios
      .post(`${rootState.environment.env.apiUrl}auth/logout`, {}, { withCredentials: true })
      .then(result => {
        commit('setUsername', null);
        return result;
      });
  },
  login({ commit, dispatch, getters, rootState }, { username, password }) {
    return this.$axios
      .post(
        `${rootState.environment.env.apiUrl}auth/login`,
        {
          username,
          password
        },
        { withCredentials: true }
      )
      .then(result => {
        dispatch('getUser');
        return result;
      });
  },
  async register({ commit, rootState }, { username, password, captchaSolution }) {
    const captchaToken = rootState.captcha.token;
    if (captchaToken) {
      try {
        const result = await Axios.post(`${rootState.environment.env.apiUrl}auth/register`, {
          username,
          password,
          captchaToken,
          captchaSolution
        });
        if (result.data.success) {
          commit('setUsername', result.data.username);
          return result.data.username;
        }
      } catch (err) {
        console.log(err.message);
        throw new Error('Registration failed: ' + err.message);
      }
    }
  }
};
