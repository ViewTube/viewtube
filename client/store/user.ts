import { getterTree, mutationTree } from 'typed-vuex';
import { declareActionTree } from '@/plugins/actionTree.shim';

export const state = () => ({
  username: null as string,
  profileImage: null as string
});

export const getters = getterTree(state, {
  username: state => state.username,
  profileImage: state => state.profileImage,
  isLoggedIn: state => Boolean(state.username)
});

export const mutations = mutationTree(state, {
  setUsername(state, username) {
    state.username = username;
  },
  setProfileImage(state, image) {
    state.profileImage = image;
  }
});

export const actions = declareActionTree(
  { state, getters, mutations },
  {
    async getUser({ commit }): Promise<void> {
      try {
        const result = await this.$axios.get(
          `${this.app.$accessor.environment.env.apiUrl}user/profile`,
          {
            withCredentials: true,
            timeout: 10000
          }
        );
        this.app.$accessor.settings.mutateSettings(result.data.settings);
        commit('setUsername', result.data.username);
        commit('setProfileImage', result.data.profileImage);
      } catch (e) {
        if (!e.message.includes('timeout') && !e.message.includes('401')) {
          console.error(e);
        }
      }
    },
    async logout({ commit }): Promise<boolean> {
      await this.$axios.post(
        `${this.app.$accessor.environment.env.apiUrl}auth/logout`,
        {},
        { withCredentials: true }
      );
      commit('setUsername', null);
      return true;
    },
    async login({ dispatch }, { username, password }): Promise<{ success?: boolean; error?: any }> {
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
        if (err && err.response && err.response.data && err.response.data.message) {
          return {
            error: err.response.data.message
          };
        }
        return {
          error: 'Sign in failed, please try reloading the page.'
        };
      }
      return { success };
    },
    async register(
      { dispatch },
      { username, password, captchaSolution }
    ): Promise<{ username?: string; error?: any }> {
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
            dispatch('getUser');
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
