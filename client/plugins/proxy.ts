import { useAccessor } from '@/store/index';

export const useImgProxy = () => {
  const accessor = useAccessor();
  return { url: accessor.environment.imgProxyUrl };
};
