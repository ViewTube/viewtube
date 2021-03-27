import { getterTree, mutationTree } from 'nuxt-typed-vuex';

export const state = () => ({
  popupOpen: false,
  currentPopupName: null
});

export const getters = getterTree(state, {
  isPopupOpen: state => state.popupOpen
});

export const mutations = mutationTree(state, {
  setPopupOpen: (state, isPopupOpen) => {
    state.popupOpen = isPopupOpen;
  },
  openPopup: (state, popupName) => {
    state.currentPopupName = popupName;
  },
  afterOpenPopup: state => {
    state.currentPopupName = null;
  }
});
