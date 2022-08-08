export const getPlaylists = (id: string | string[]) => {
  const config = useRuntimeConfig();

  return $fetch<any>(`${config.public.apiUrl}playlists/${id}`);
};
