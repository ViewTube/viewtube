export const getPlaylists = (id: string | string[]) => {
  const { apiUrl } = useApiUrl();

  return vtClientFetch<any>(`${apiUrl.value}playlists/${id}`);
};
