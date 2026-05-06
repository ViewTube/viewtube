import { useUserStore } from '~/store/user';
import type { Pinia } from 'pinia';

export default defineNuxtPlugin(async nuxtApp => {
  const userStore = useUserStore(nuxtApp.$pinia as Pinia);

  const refreshToken = useCookie('RefreshToken');

  if (refreshToken.value && !userStore.triedLogin) {
    await userStore.getUser();
  }
});
