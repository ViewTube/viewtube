import { actionTree, getterTree, mutationTree } from 'nuxt-typed-vuex';

export const state = () => ({
  username: null as string
});

export const getters = getterTree(state, {
  username: state => state.username,
  isLoggedIn: state => Boolean(state.username)
});

export const mutations = mutationTree(state, {
  setUsername(state, username) {
    state.username = username;
  }
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    getUser({ commit }) {
      return this.$axios
        .get(`${this.app.$accessor.environment.env.apiUrl}user/profile`, {
          withCredentials: true
        })
        .then(result => {
          commit('setUsername', result.data.username);
        })
        .catch(() => {});
    },
    logout({ commit }) {
      return this.$axios
        .post(
          `${this.app.$accessor.environment.env.apiUrl}auth/logout`,
          {},
          { withCredentials: true }
        )
        .then(result => {
          commit('setUsername', null);
          return result;
        });
    },
    login({ dispatch }, { username, password }) {
      return this.$axios
        .post(
          `${this.app.$accessor.environment.env.apiUrl}auth/login`,
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
    async register({ commit }, { username, password, captchaSolution }) {
      const captchaToken = this.app.$accessor.captcha.token;
      if (captchaToken) {
        try {
          const result = await this.$axios.post(
            `${this.app.$accessor.environment.env.apiUrl}auth/register`,
            {
              username,
              password,
              captchaToken,
              captchaSolution
            }
          );
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
  }
);
