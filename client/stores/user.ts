import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('user', {
  state: () => ({
    username: null,
    profileImage: null
  }),
  getters: {
    isLoggedIn: state => !!state.username
  },
  actions: {
    async getUser() {
      
    }
  }
});
