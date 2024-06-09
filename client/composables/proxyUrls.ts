export const useProxyUrls = () => {
  const { apiUrl: clientApiUrl } = useApiUrl(true);

  const origin = window?.location?.origin ?? '';

  const streamProxy = `${clientApiUrl.value}proxy/stream?url=`;
  return {
    imgProxy: `${clientApiUrl.value}proxy/image?url=`,
    streamProxy,
    m3u8Proxy: `${clientApiUrl.value}proxy/m3u8?proxyUrl=${origin}${streamProxy}&url=`,
    videoPlaybackProxy: `${clientApiUrl.value}videoplayback`,
    textProxy: `${clientApiUrl.value}proxy/text?url=`
  };
};
