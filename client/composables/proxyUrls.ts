export const useProxyUrls = () => {
  const { apiUrl } = useApiUrl();
  return {
    textProxy: `${apiUrl}proxy/text?url=`,
    imgProxy: `${apiUrl}proxy/image?url=`,
    streamProxy: `${apiUrl}proxy/stream?url=`,
    videoPlaybackProxy: `${apiUrl}videoplayback`
  };
};
