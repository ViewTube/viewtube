import { getterTree, mutationTree } from 'typed-vuex';
import { declareActionTree } from '@/plugins/actionTree.shim';

export const state = () => ({
  token: '' as string,
  solution: '' as string,
  image: '' as string
});

export const getters = getterTree(state, {
  image: state => state.image
});

export const mutations = mutationTree(state, {
  setToken(state, token) {
    state.token = token;
  },
  setImage(state, image) {
    state.image = image;
  }
});

export const actions = declareActionTree(
  { state, getters, mutations },
  {
    getCaptcha({ commit }): void {
      this.$axios
        .get(this.app.$accessor.environment.env.apiUrl + 'auth/captcha')
        .then(response => {
          commit('setToken', response.data.token);
          commit('setImage', response.data.captchaImage);
        })
        .catch(_ => {});
    }
  }
);
