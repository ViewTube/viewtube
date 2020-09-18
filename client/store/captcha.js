import Axios from 'axios';
// import Commons from '@/plugins/commons';

export const state = () => ({
  token: null,
  solution: null,
  image: null
});
export const getters = {
  image: state => state.image
};
export const mutations = {
  setToken(state, token) {
    state.token = token;
  },
  setImage(state, image) {
    state.image = image;
  }
};
export const actions = {
  getCaptcha({ commit, rootState }) {
    Axios.get(rootState.environment.env.apiUrl + 'auth/captcha')
      .then(response => {
        commit('setToken', response.data.token);
        commit('setImage', response.data.captchaImage);
      })
      .catch(err => console.error(err));
  }
};
