const serverApiUrl = () => {
  const port = process.env.PORT;
  return `http://localhost:${port}/api/`;
};

const devServerApi = () => {
  const port = process.env.API_DEV_PORT;
  return `http://localhost:${port}/api/`;
};

export const useApiUrl = (clientOnly = false) => {
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
