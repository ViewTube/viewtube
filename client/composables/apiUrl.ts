import { useRuntimeEnvironmentStore } from '@/store/runtimeEnvironment';
import { getApiUrl } from '../../shared';

export const useApiUrl = () => {
  const runtimeEnvironmentStore = useRuntimeEnvironmentStore();
  if (!runtimeEnvironmentStore.apiUrl) {
    const apiUrl = getApiUrl();
    if (apiUrl) {
      runtimeEnvironmentStore.setApiUrl(getApiUrl());
    } else {
      throw new Error('Could not retrieve API URL. Make sure VIEWTUBE_URL is set.');
    }
  }
  return { apiUrl: runtimeEnvironmentStore.apiUrl };
};
