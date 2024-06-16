export const useImgProxy = () => {
  const { imgProxy } = useProxyUrls();

  const proxyUrl = (url: string) => {
    let correctedUrl = url;
    if (!url) return '';
    if (url.startsWith('//')) {
      correctedUrl = `https:${url}`;
    }
    correctedUrl = encodeURIComponent(correctedUrl);
    return `${imgProxy}${correctedUrl}`;
  };

  return { proxyUrl };
};
