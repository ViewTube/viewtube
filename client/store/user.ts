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
    async getUser({ commit }) {
      try {
        const result = await this.$axios.get(
          `${this.app.$accessor.environment.env.apiUrl}user/profile`,
          {
            withCredentials: true
          }
        );
        commit('setUsername', result.data.username);
      } catch (e) {}
    },
    async logout({ commit }) {
      await this.$axios.post(
        `${this.app.$accessor.environment.env.apiUrl}auth/logout`,
        {},
        { withCredentials: true }
      );
      commit('setUsername', null);
      return true;
    },
    async login({ dispatch }, { username, password }) {
      let loggedInUsername = null;
      try {
        const result = await this.$axios.post(
          `${this.app.$accessor.environment.env.apiUrl}auth/login`,
          {
            username,
            password
          },
          { withCredentials: true }
        );
        dispatch('getUser');

        loggedInUsername = { username: result.data.username };
      } catch (err) {
        if (err.response.data.message) {
          return {
            error: err.response.data.message
          };
        }
        return {
          error: 'Login failed'
        };
      }
      return loggedInUsername;
    },
    async register({ commit }, { username, password, captchaSolution }) {
      if (this.app.$accessor.captcha.token) {
        let registeredUsername = null;
        try {
          const result = await this.$axios.post(
            `${this.app.$accessor.environment.env.apiUrl}auth/register`,
            {
              username,
              password,
              captchaToken: this.app.$accessor.captcha.token,
              captchaSolution
            }
          );
          commit('setUsername', result.data.username);
          registeredUsername = result.data.username;
        } catch (err) {
          if (err.response.data) {
            return {
              error: err.response.data
            };
          }
          return {
            error: 'Registration failed'
          };
        }
        return { username: registeredUsername };
      }
    }
  }
);
