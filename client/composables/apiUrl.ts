const serverApiUrl = () => {
  return '/api/';
};

const devServerApi = () => {
  const port = process.env.API_DEV_PORT;
  return `http://localhost:${port}/api/`;
};

export const useApiUrl = (clientOnly = false) => {
  return {
    apiUrl: computed(() => {
      if (process.server && !clientOnly && process.env.NODE_ENV !== 'production') {
        return devServerApi();
      }
      return '/api/';
    })
  };
};
