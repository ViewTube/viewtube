import { getterTree, mutationTree, actionTree } from 'nuxt-typed-vuex';
import Commons from '~/plugins/commons';

export const state = () => ({
  currentInstance: '' as string,
  instances: [] as { url: string; health: string }[]
});

export const getters = getterTree(state, {
  currentInstance(state) {
    return state.currentInstance;
  },
  currentInstanceApi(getters) {
    let instance = getters.currentInstance;

    // Workaround for serverside instance
    if (process.server) {
      instance = 'https://invidious.snopyta.org';
    }
    if (!instance.endsWith('/')) instance += '/';
    return instance + 'api/';
  },
  currentInstanceApiV1(_state, getters) {
    return getters.currentInstanceApi + 'v1/';
  },
  instances(state) {
    return state.instances;
  }
});

export const mutations = mutationTree(state, {
  changeInstance(state, instance) {
    state.currentInstance = instance;
  },
  addInstance(state, { url, health }) {
    state.instances.push({ url, health });
  },
  clearInstances(state) {
    state.instances = [];
  }
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    fetchInstances({ commit, state }) {
      commit('clearInstances');
      this.$axios
        .get(
          `${Commons.proxyUrl}https://raw.githubusercontent.com/iv-org/documentation/master/Invidious-Instances.md`
        )
        .then(response => {
          const fetchData = response.data.split('### Blocked:')[0];
          const regex = /\[(?<host>[^ \]]+)\]\((?<uri>[^)]+)\)(?! - offline)/g;
          const matches = [...fetchData.matchAll(regex)];
          for (const match of matches) {
            if (!match[2].includes('.onion') && !match[2].includes('.i2p')) {
              if (match[2].endsWith('/')) {
                commit('addInstance', {
                  url: match[2].substring(0, match[2].length - 1),
                  health: null
                });
              } else {
                commit('addInstance', {
                  url: match[2],
                  health: null
                });
              }
            }
          }
          if (state.currentInstance.length === 0) {
            commit('changeInstance', matches[0][2]);
          }
        });
    }
  }
);
