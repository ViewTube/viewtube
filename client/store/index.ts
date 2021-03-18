import { getAccessorType, actionTree } from 'nuxt-typed-vuex';
import { Context } from '@nuxt/types';
import { wrapProperty } from '@nuxtjs/composition-api';
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
    async nuxtServerInit(_vuexContext, nuxtContext: Context): Promise<void> {
      if (process.server) {
        _vuexContext.commit('environment/setEnv', {
          apiUrl: process.env.VIEWTUBE_API_URL,
          vapidKey: process.env.VIEWTUBE_PUBLIC_VAPID,
          nodeEnv: process.env.NODE_ENV,
          host: process.env.HOST || '192.168.178.21',
          port: process.env.PORT || 8066,
          baseUrl: process.env.BASE_URL || 'http://192.168.178.21:8066'
        });
        await nuxtContext.app.$accessor.user.getUser();
        if (_vuexContext.getters['instances/instances'].length === 0) {
          await nuxtContext.app.$accessor.instances.fetchInstances();
        }
      }
      return undefined;
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

export const useAccessor = wrapProperty('$accessor', false);
