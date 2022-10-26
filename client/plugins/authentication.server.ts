import { useUserStore } from '~~/store/user';

export default defineNuxtPlugin(async nuxtApp => {
  const userStore = useUserStore(nuxtApp.$pinia);

  const cookies = parseCookie(nuxtApp.ssrContext.event.req.headers.cookie);

  if (cookies.Authentication) {
    await userStore.getUser(cookies.Authentication);
  }
});

const parseCookie = (str: string): Record<string, string> =>
  str
    .split(';')
    .map(value => value.split('='))
    .reduce((acc, value) => {
      acc[decodeURIComponent(value[0].trim())] = decodeURIComponent(value[1].trim());
      return acc;
    }, {});
