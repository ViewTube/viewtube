import { Context } from '@nuxt/types';
import createPersistedState from 'vuex-persistedstate';

export default ({ store }: Context) => {
  createPersistedState({
    key: 'viewtube',
    paths: ['instances', 'settings', 'videoProgress', 'theme'],
    fetchBeforeUse: true
  })(store);
};
