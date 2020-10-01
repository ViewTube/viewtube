import { getAccessorType, actionTree } from 'nuxt-typed-vuex';
import * as captcha from '~/store/captcha';
import * as environment from '~/store/environment';
import * as instances from '~/store/instances';
import * as messages from '~/store/messages';
import * as miniplayer from '~/store/miniplayer';
import * as settings from '~/store/settings';
import * as user from '~/store/user';
import * as videoPlayer from '~/store/videoPlayer';
import * as videoProgress from '~/store/videoProgress';

export const state = () => ({});

export type RootState = ReturnType<typeof state>;

export const actions = actionTree(
  { state },
  {
    nuxtServerInit({ dispatch, getters }) {
      if (process.server) {
        this.app.$accessor.environment.setEnv({
          apiUrl: process.env.VIEWTUBE_API_URL,
          vapidKey: process.env.VIEWTUBE_PUBLIC_VAPID,
          nodeEnv: process.env.NODE_ENV,
          host: process.env.HOST || 'localhost',
          port: process.env.PORT || 8066,
          baseUrl: process.env.BASE_URL || 'http://localhost:8066'
        });
        dispatch('user/getUser');
        if (getters['instances/instances'].length === 0) {
          dispatch('instances/fetchInstances');
        }
      }
    }
  }
);

export const accessorType = getAccessorType({
  actions,
  state,
  modules: {
    captcha,
    environment,
    instances,
    messages,
    miniplayer,
    settings,
    user,
    videoPlayer,
    videoProgress
  }
});
