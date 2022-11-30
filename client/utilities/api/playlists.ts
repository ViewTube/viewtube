export const getPlaylists = (id: string | string[]) => {
  const { apiUrl } = useApiUrl();

  return $fetch<any>(`${apiUrl}playlists/${id}`);
};
