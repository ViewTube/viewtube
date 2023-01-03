export const useAuthorizationHeader = (): string | undefined => {
  let authorizationToken: string | undefined;
  const nuxt = useNuxtApp();
  if (nuxt.ssrContext) {
    const cookies = parseCookieString(nuxt.ssrContext.event.req.headers?.cookie);
    authorizationToken = cookies?.Authentication;
  }

  return authorizationToken ? `Bearer ${authorizationToken}` : undefined;
};
