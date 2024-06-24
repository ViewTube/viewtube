export const useProxyUrls = () => {
  const { apiUrl: clientApiUrl } = useApiUrl(true);

  const origin = window?.location?.origin ?? '';

  const streamProxy = `${clientApiUrl.value}proxy/stream?originUrl=${origin}&url=`;

  const applyStreamProxy = (url: string) => {
    if (url.includes(streamProxy)) {
      return url;
    }
    return `${streamProxy}${encodeURIComponent(url)}`;
  };

  return {
    imgProxy: `${clientApiUrl.value}proxy/image?url=`,
    applyStreamProxy,
    videoPlaybackProxy: `${clientApiUrl.value}videoplayback`,
    textProxy: `${clientApiUrl.value}proxy/text?url=`
  };
};
