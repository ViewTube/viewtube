export const useImgProxy = () => {
  const { imgProxy } = useProxyUrls();
  return { url: imgProxy };
};
