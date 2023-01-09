export const useGetInvidiousLicense = () => {
  const { textProxy } = useProxyUrls();

  const url = `${textProxy}https://raw.githubusercontent.com/iv-org/invidious/master/LICENSE`;

  return useLazyAsyncData<string>('invidious-license', () => $fetch(url));
};
