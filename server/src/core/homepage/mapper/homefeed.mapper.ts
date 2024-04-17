import { toVTVideoDto } from 'server/mapper/converter/video/vt-video.converter';
import type { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import type { IBrowseResponse } from 'youtubei.js';
import { YTNodes } from 'youtubei.js';
import type { TabbedFeed } from 'youtubei.js/dist/src/core/mixins';

export const mapHomeFeed = (homeFeed: TabbedFeed<IBrowseResponse>): Array<VTVideoDto> => {
  return homeFeed.videos
    .map(item => {
      if (item.type === 'Video') {
        const original = item.as(YTNodes.Video);
        return toVTVideoDto(original);
      }
    })
    .filter(item => item);
};
