import { defineStore } from 'pinia';

export const usePopupStore = defineStore('popup', {
  state: () => ({
    popupOpen: false,
    currentPopupName: null as string | null
  }),

  actions: {
    setPopupOpen(isPopupOpen: boolean) {
      this.popupOpen = isPopupOpen;
    },
    openPopup(popupName: string) {
      this.currentPopupName = popupName;
    },
    afterOpenPopup() {
      this.currentPopupName = null;
    }
  }
});
