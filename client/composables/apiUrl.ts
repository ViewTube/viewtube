import { useRuntimeEnvironmentStore } from '@/store/runtimeEnvironment';
import { getApiUrl } from '../../shared';

const serverApiUrl = () => {
  const port = process.env.PORT;
  return `http://localhost:${port}/api/`;
};

const devServerApi = () => {
  const port = process.env.API_DEV_PORT;
  return `http://localhost:${port}/api/`;
};

export const useApiUrl = (clientOnly = false) => {
  const runtimeEnvironmentStore = useRuntimeEnvironmentStore();
  if (!runtimeEnvironmentStore.apiUrl) {
    const apiUrl = getApiUrl();
    if (apiUrl) {
      runtimeEnvironmentStore.setApiUrl(getApiUrl());
    } else {
      throw new Error('Could not retrieve API URL. Make sure VIEWTUBE_URL is set.');
    }
  }

  return {
    apiUrl: computed(() => {
      if (process.server && !clientOnly) {
        if (process.env.NODE_ENV === 'production') {
          return serverApiUrl();
        } else {
          return devServerApi();
        }
      } else {
        return '/api/';
      }
    })
  };
};
