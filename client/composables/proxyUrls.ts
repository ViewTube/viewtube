export const useProxyUrls = () => {
  const { apiUrl: clientApiUrl } = useApiUrl(true);
  return {
    textProxy: `${clientApiUrl}proxy/text?url=`,
    imgProxy: `${clientApiUrl}proxy/image?url=`,
    streamProxy: `${clientApiUrl}proxy/stream?url=`,
    videoPlaybackProxy: `${clientApiUrl}videoplayback`
  };
};
