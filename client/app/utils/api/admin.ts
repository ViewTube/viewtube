export const addBlockedVideo = (videoId: string) => {
  const { apiUrl } = useApiUrl();

  return vtClientFetch<string>(`${apiUrl.value}admin/blocked-videos`, {
    method: 'POST',
    body: JSON.stringify(videoId)
  });
};

export const removeBlockedVideo = (videoId: string) => {
  const { apiUrl } = useApiUrl();

  return vtClientFetch<string>(`${apiUrl.value}admin/blocked-videos/${videoId}`, {
    method: 'DELETE'
  });
};
