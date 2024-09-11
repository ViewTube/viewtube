import { useUserStore } from '~/store/user';
import { parseCookies } from 'h3';
import type { Pinia } from 'pinia';

/**
 * This plugin runs user authentication server-side,
 * if there is an existing authentication cookie
 */
export default defineNuxtPlugin(async nuxtApp => {
  const userStore = useUserStore(nuxtApp.$pinia as Pinia);

  const cookies = parseCookies(nuxtApp.ssrContext.event);

  if (cookies?.RefreshToken && !userStore.triedLogin) {
    await userStore.getUser();
  }
});
