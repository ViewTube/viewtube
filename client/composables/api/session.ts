export const useGetSessions = () => {
  const { apiUrl } = useApiUrl();
  const { vtFetch } = useVtFetch();

  const urlPart = `user/sessions`;

  return useLazyAsyncData(urlPart, () => vtFetch(`${apiUrl.value}${urlPart}`));
};
