import { actionTree, getterTree, mutationTree } from 'nuxt-typed-vuex';

export const state = () => ({
  username: null as string
});

export const getters = getterTree(state, {
  username: state => state.username,
  isLoggedIn: state => Boolean(state.username)
});

export const mutations = mutationTree(state, {
  setUsername(state, username: string) {
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
      let success = null;
      try {
        await this.$axios.post(
          `${this.app.$accessor.environment.env.apiUrl}auth/login`,
          {
            username,
            password
          },
          { withCredentials: true }
        );
        dispatch('getUser');

        success = true;
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
      return { success };
    },
    async register({ commit, dispatch }, { username, password, captchaSolution }) {
      if (this.app.$accessor.captcha.token) {
        let registerResult = null;
        try {
          registerResult = await this.$axios.post(
            `${this.app.$accessor.environment.env.apiUrl}auth/register`,
            {
              username,
              password,
              captchaToken: this.app.$accessor.captcha.token,
              captchaSolution
            }
          );
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
        if (registerResult && registerResult.data) {
          const loginSuccess = await dispatch('login', {
            username: registerResult.data.username,
            password
          });
          if (loginSuccess) {
            commit('setUsername', registerResult.data.username);
            return { username: registerResult.data.username };
          }
        }
        return {
          error: 'Registration failed'
        };
      }
    }
  }
);
