import { getAccessorType } from 'typed-vuex';
import * as captcha from '@/store/captcha';
import * as messages from '@/store/messages';
import * as miniplayer from '@/store/miniplayer';
import * as settings from '@/store/settings';
import * as user from '@/store/user';
import * as videoPlayer from '@/store/videoPlayer';
import * as playerVolume from '@/store/playerVolume';
import * as popup from '@/store/popup';
import { declareActionTree } from '@/utilities/actionTree.shim';

export const state = () => ({});

export type RootState = ReturnType<typeof state>;

export const actions = declareActionTree(
  { state },
  {
    async nuxtServerInit(_vuexContext, nuxtContext): Promise<void> {
      if (process.server) {
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
    messages,
    miniplayer,
    settings,
    user,
    popup,
    videoPlayer,
    playerVolume
  }
});
