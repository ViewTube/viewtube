export const useGetPlaylists = (id: string, { pages = 1 }) => {
  const config = useRuntimeConfig();

  return useLazyFetch(`${config.public.apiUrl}playlists?playlistId=${id}&pages=${pages}`);
};

export const useGetPlaylistsContinuation = (continuationData: any) => {
  const config = useRuntimeConfig();

  return useLazyFetch(
    `${config.public.apiUrl}playlists/continuation?continuationData=${JSON.stringify(continuationData)}`
  );
};
