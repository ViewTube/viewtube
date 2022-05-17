import { useAccessor } from '@/hooks/accessor';

export const useImgProxy = () => {
  const accessor = useAccessor();
  return { url: accessor.environment.imgProxyUrl };
};
