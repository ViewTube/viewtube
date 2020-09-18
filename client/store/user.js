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
  getUser({ getters, commit }) {
    console.log('getting user...');
    this.$axios
      .get(`${this.$store.getters['environment/apiUrl']}user/profile`, {
        withCredentials: true
      })
      .then(result => {
        commit('setUsername', result.data.username);
      });
  },
  logout({ commit }) {
    return this.$axios
      .post(
        `${this.$store.getters['environment/apiUrl']}auth/logout`,
        {},
        { withCredentials: true }
      )
      .then(result => {
        commit('setUsername', null);
        return result;
      });
  },
  login({ commit, dispatch, getters }, { username, password }) {
    return this.$axios
      .post(
        '/api/auth/login',
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
  register({ commit, rootState }, { username, password, captchaSolution }) {
    const captchaToken = rootState.captcha.token;
    if (captchaToken) {
      return Axios.post(`${this.$store.getters['environment/apiUrl']}auth/register`, {
        username,
        password,
        captchaToken,
        captchaSolution
      })
        .then(
          result => {
            if (result.data.success) {
              commit('setUsername', result.data.username);
              return result.data.username;
            }
          },
          reason => {
            // console.log(reason)
            throw new Error('Registration failed: ' + reason);
          }
        )
        .catch(err => {
          console.log(err.message);
          throw new Error('Registration failed: ' + err.message);
        });
    }
  }
};
