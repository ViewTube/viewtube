import { parseCookie } from '@/utilities/parseCookies';

export const useAuthorizationHeader = (): string | undefined => {
  let authorizationToken;
  const nuxt = useNuxtApp();
  if (nuxt.ssrContext) {
    const cookies = parseCookie(nuxt.ssrContext.event.req.headers?.cookie);
    authorizationToken = cookies?.Authentication;
  }

  return authorizationToken ? `Bearer ${authorizationToken}` : undefined;
};
