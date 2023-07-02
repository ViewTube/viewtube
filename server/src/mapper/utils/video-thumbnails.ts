import { VTThumbnailDto } from '../dto/vt-thumbnail.dto';

export const generateVideoThumbnails = (id: string): Array<VTThumbnailDto> => {
  return [
    {
      quality: 'maxresdefault',
      url: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      width: 1280,
      height: 720
    },
    {
      quality: 'sddefault',
      url: `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
      width: 640,
      height: 480
    },
    {
      quality: 'high',
      url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      width: 480,
      height: 360
    },
    {
      quality: 'medium',
      url: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
      width: 320,
      height: 180
    },
    {
      quality: 'default',
      url: `https://i.ytimg.com/vi/${id}/default.jpg`,
      width: 120,
      height: 90
    },
    {
      quality: 'start',
      url: `https://i.ytimg.com/vi/${id}/1.jpg`,
      width: 120,
      height: 90
    },
    {
      quality: 'middle',
      url: `https://i.ytimg.com/vi/${id}/2.jpg`,
      width: 120,
      height: 90
    },
    {
      quality: 'end',
      url: `https://i.ytimg.com/vi/${id}/3.jpg`,
      width: 120,
      height: 90
    }
  ];
};
