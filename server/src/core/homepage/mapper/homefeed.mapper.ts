import { toVTVideoDto } from 'server/mapper/converter/video/vt-video.converter';
import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import { YTNodes } from 'youtubei.js';
import { HomeFeed } from 'youtubei.js/dist/src/parser/youtube';

export const mapHomeFeed = (homeFeed: HomeFeed): Array<VTVideoDto> => {
  return homeFeed.videos
    .map(item => {
      if (item.type === 'Video') {
        const original = item.as(YTNodes.Video);
        return toVTVideoDto(original);
      }
    })
    .filter(item => item);
};
