import type { Pinia } from 'pinia';
import { useUserStore } from '~/store/user';

export default defineNuxtPlugin(async nuxtApp => {
  const userStore = useUserStore(nuxtApp.$pinia as Pinia);

  const refreshToken = useCookie('RefreshToken');

  if (refreshToken.value && !userStore.triedLogin) {
    await userStore.getUser();
  }
});
