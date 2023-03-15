import { useUserStore } from '@/store/user';
import { Pinia } from 'pinia';

/**
 * This plugin runs user authentication server-side,
 * if there is an existing authentication cookie
 */
export default defineNuxtPlugin(async nuxtApp => {
  const userStore = useUserStore(nuxtApp.$pinia as Pinia);

  const cookies = parseCookieString(nuxtApp.ssrContext.event.req.headers?.cookie);

  if (cookies?.Authentication) {
    await userStore.getUser(cookies.Authentication);
  }
});
