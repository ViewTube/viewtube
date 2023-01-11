export const useProxyUrls = () => {
  const { apiUrl: clientApiUrl } = useApiUrl(true);
  return {
    textProxy: `${clientApiUrl.value}proxy/text?url=`,
    imgProxy: `${clientApiUrl.value}proxy/image?url=`,
    streamProxy: `${clientApiUrl.value}proxy/stream?url=`,
    videoPlaybackProxy: `${clientApiUrl.value}videoplayback`
  };
};
