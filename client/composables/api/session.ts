export const useGetSessions = () => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const urlPart = `user/sessions`;

  return useLazyAsyncData(urlPart, () => vtFetch(`${apiUrl.value}${urlPart}`));
};

export const useGetCurrentSession = () => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const urlPart = `user/sessions/current`;

  return useLazyAsyncData(urlPart, () => vtFetch(`${apiUrl.value}${urlPart}`));
};
