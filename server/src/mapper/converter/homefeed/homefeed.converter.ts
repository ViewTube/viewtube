import { toVTVideoDto } from 'server/mapper/converter/video/vt-video.converter';
import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import { IBrowseResponse, YTNodes } from 'youtubei.js';
import { TabbedFeed } from 'youtubei.js/dist/src/core/mixins';

export const toHomeFeed = (homeFeed: TabbedFeed<IBrowseResponse>): Array<VTVideoDto> => {
  return homeFeed.videos
    .filter(item => item.type === 'Video')
    .map(item => {
        const original = item.as(YTNodes.Video);
        return toVTVideoDto(original);
    })
    .filter(item => item);
};
