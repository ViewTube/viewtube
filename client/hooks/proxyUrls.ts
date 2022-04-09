export const useProxyUrls = () => {
  const config = useRuntimeConfig();
  return {
    textProxy: `${config.apiUrl}proxy/text?url=`,
    imgProxy: `${config.apiUrl}proxy/image?url=`,
    streamProxy: `${config.apiUrl}proxy/stream?url=`,
    videoPlaybackProxy: `${config.apiUrl}videoplayback`
  };
};
