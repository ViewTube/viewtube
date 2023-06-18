export const getPlaylists = (id: string | string[]) => {
  const { apiUrl } = useApiUrl();

  return vtFetch<any>(`${apiUrl.value}playlists/${id}`);
};
