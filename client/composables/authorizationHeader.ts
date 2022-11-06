import { parseCookie } from '@/utilities/parseCookies';

export const useAuthorizationHeader = (): string | undefined => {
  let authorizationToken;
  if (process?.server) {
    const nuxt = useNuxtApp();
    const cookies = parseCookie(nuxt.ssrContext.event.req.headers?.cookie);
    authorizationToken = cookies?.Authentication;
  }

  return authorizationToken ? `Bearer ${authorizationToken}` : undefined;
};
