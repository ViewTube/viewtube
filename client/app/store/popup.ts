import { defineStore } from 'pinia';

export const usePopupStore = defineStore('popup', {
  state: () => ({
    popupOpen: false
  }),

  actions: {
    setPopupOpen(isPopupOpen: boolean) {
      this.popupOpen = isPopupOpen;
    }
  }
});
