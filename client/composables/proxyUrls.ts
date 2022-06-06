export const useProxyUrls = () => {
  const config = useRuntimeConfig();
  return {
    textProxy: `${config.public.apiUrl}proxy/text?url=`,
    imgProxy: `${config.public.apiUrl}proxy/image?url=`,
    streamProxy: `${config.public.apiUrl}proxy/stream?url=`,
    videoPlaybackProxy: `${config.public.apiUrl}videoplayback`
  };
};
