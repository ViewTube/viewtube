import { getAccessorType } from 'typed-vuex';
import { Context } from '@nuxt/types';
import { wrapProperty } from '@nuxtjs/composition-api';
import * as captcha from '@/store/captcha';
import * as environment from '@/store/environment';
import * as messages from '@/store/messages';
import * as miniplayer from '@/store/miniplayer';
import * as settings from '@/store/settings';
import * as user from '@/store/user';
import * as videoPlayer from '@/store/videoPlayer';
import * as playerVolume from '@/store/playerVolume';
import * as popup from '@/store/popup';
import { declareActionTree } from '@/plugins/actionTree.shim';
import { EnvironmentService } from '@/plugins/services/environment';

export const state = () => ({});

export type RootState = ReturnType<typeof state>;

export const actions = declareActionTree(
  { state },
  {
    async nuxtServerInit(_vuexContext, nuxtContext: Context): Promise<void> {
      if (process.server) {
        const envVars = EnvironmentService.getEnvironmentVariables();
        nuxtContext.app.$accessor.environment.setEnv({
          apiUrl: envVars.apiUrl,
          vapidKey: envVars.vapidKey,
          nodeEnv: envVars.nodeEnv
        });
        if (nuxtContext.req.headers.cookie) {
          await nuxtContext.app.$accessor.user.getUser();
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
