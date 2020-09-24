export const actions = {
  nuxtServerInit({ rootState, dispatch }) {
    if (process.server) {
      rootState.environment.env = {
        apiUrl: process.env.VIEWTUBE_API_URL,
        vapidKey: process.env.VIEWTUBE_PUBLIC_VAPID,
        nodeEnv: process.env.NODE_ENV,
        host: process.env.HOST || 'localhost',
        port: process.env.PORT || 8066,
        baseUrl: process.env.BASE_URL || 'http://localhost:8066'
      };
      dispatch('user/getUser');
    }
  }
};
