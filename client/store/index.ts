import { getAccessorType, actionTree } from 'typed-vuex';
import { Context } from '@nuxt/types';
import { wrapProperty } from '@nuxtjs/composition-api';
import * as captcha from '@/store/captcha';
import * as environment from '@/store/environment';
import * as instances from '@/store/instances';
import * as messages from '@/store/messages';
import * as miniplayer from '@/store/miniplayer';
import * as settings from '@/store/settings';
import * as user from '@/store/user';
import * as videoPlayer from '@/store/videoPlayer';
import * as playerVolume from '@/store/playerVolume';
import * as popup from '@/store/popup';

export const state = () => ({});

export type RootState = ReturnType<typeof state>;

export const actions = actionTree(
  { state },
  {
    async nuxtServerInit(_vuexContext, nuxtContext: Context): Promise<void> {
      if (process.server) {
        nuxtContext.app.$accessor.environment.setEnv({
          apiUrl: process.env.VIEWTUBE_API_URL || 'http://localhost:8066/api/',
          vapidKey: process.env.VIEWTUBE_PUBLIC_VAPID,
          nodeEnv: process.env.NODE_ENV
        });
        await nuxtContext.app.$accessor.user.getUser();
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
    popup,
    videoPlayer,
    playerVolume
  }
});

export const useAccessor = wrapProperty('$accessor', false);
