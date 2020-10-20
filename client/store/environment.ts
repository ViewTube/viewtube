import { getterTree, mutationTree } from 'nuxt-typed-vuex';

export const state = () => ({
  env: { apiUrl: '', vapidKey: '', nodeEnv: '', host: '', port: '', baseUrl: '' } as {
    apiUrl: string;
    vapidKey: string;
    nodeEnv: string;
    host: string;
    port: string | number;
    baseUrl: string;
  }
});

export const getters = getterTree(state, {
  apiUrl(state) {
    return state.env.apiUrl;
  }
});

export const mutations = mutationTree(state, {
  setEnv(
    state,
    env: {
      apiUrl: string;
      vapidKey: string;
      nodeEnv: string;
      host: string;
      port: string | number;
      baseUrl: string;
    }
  ) {
    state.env = env;
  }
});
