import { defineStore } from 'pinia';

export const useRuntimeEnvironmentStore = defineStore('runtimeEnvironment', {
  state: () => ({
    apiUrl: null as string | null
  }),
  actions: {
    setApiUrl(apiUrl: string) {
      this.apiUrl = apiUrl;
    }
  }
});
