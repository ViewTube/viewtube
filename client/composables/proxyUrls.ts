export const useProxyUrls = () => {
  const { apiUrl: clientApiUrl } = useApiUrl(true);
  return {
    imgProxy: `${clientApiUrl.value}proxy/image?url=`,
    streamProxy: `${clientApiUrl.value}proxy/stream?url=`,
    videoPlaybackProxy: `${clientApiUrl.value}videoplayback`
  };
};
