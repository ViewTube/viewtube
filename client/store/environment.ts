import { getterTree, mutationTree } from 'typed-vuex';

export const state = () => ({
  env: { apiUrl: '', vapidKey: '', nodeEnv: '', host: '', port: '' } as {
    apiUrl: string;
    vapidKey: string;
    nodeEnv: string;
  }
});

export const getters = getterTree(state, {
  apiUrl(state) {
    return state.env.apiUrl;
  },
  textProxyUrl(state) {
    return `${state.env.apiUrl}proxy/text?url=`;
  },
  imgProxyUrl(state) {
    return `${state.env.apiUrl}proxy/image?url=`;
  },
  streamProxyUrl(state) {
    return `${state.env.apiUrl}proxy/stream?url=`;
  },
  videoPlaybackProxyUrl(state) {
    return `${state.env.apiUrl}videoplayback`;
  },
  vapidKey(state) {
    return state.env.vapidKey;
  }
});

export const mutations = mutationTree(state, {
  setEnv(
    state,
    env: {
      apiUrl: string;
      vapidKey: string;
      nodeEnv: string;
    }
  ) {
    state.env = env;
  }
});
