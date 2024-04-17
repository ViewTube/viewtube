import { useUserStore } from '~/store/user';

export default defineNuxtRouteMiddleware(to => {
  const userStore = useUserStore();
  const config = useRuntimeConfig();

  if (userStore.isLoggedIn) {
    if (to.path === '/login' || to.path === '/register') {
      return navigateTo('/');
    }
  } else if (
    config.public.requireLoginEverywhere === true &&
    to.path !== '/login' &&
    to.path !== '/register'
  ) {
    return navigateTo('/login');
  }
});
