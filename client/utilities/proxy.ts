import { useProxyUrls } from '@/hooks/proxyUrls';

export const useImgProxy = () => {
  const { imgProxy } = useProxyUrls();
  return { url: imgProxy };
};
