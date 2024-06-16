export const useProxyUrls = () => {
  const { apiUrl: clientApiUrl } = useApiUrl(true);

  const origin = window?.location?.origin ?? '';

  const streamProxy = `${clientApiUrl.value}proxy/stream?originUrl=${origin}&url=`;
  return {
    imgProxy: `${clientApiUrl.value}proxy/image?url=`,
    streamProxy,
    videoPlaybackProxy: `${clientApiUrl.value}videoplayback`,
    textProxy: `${clientApiUrl.value}proxy/text?url=`
  };
};
