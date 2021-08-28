import { Context } from '@nuxt/types';
import createPersistedState from 'vuex-persistedstate';

export default ({ store }: Context) => {
  createPersistedState({
    key: 'viewtube',
    paths: ['settings', 'playerVolume'],
    fetchBeforeUse: true,
    getState: (key: string, storage: Storage) => {
      const storageString = storage.getItem(key);
      if (storageString) {
        const jsonStorage = JSON.parse(storageString);
        if (store.getters['user/isLoggedIn'] && 'settings' in jsonStorage) {
          delete jsonStorage.settings;
        }
        return jsonStorage;
      }
      return undefined;
    }
  })(store);
};
