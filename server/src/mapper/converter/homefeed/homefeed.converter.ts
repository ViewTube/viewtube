import { toVTVideoDto } from 'server/mapper/converter/video/vt-video.converter';
import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import { IBrowseResponse, Mixins, YTNodes } from 'youtubei.js';

export const toHomeFeed = (homeFeed: Mixins.TabbedFeed<IBrowseResponse>): Array<VTVideoDto> => {
  return homeFeed.videos
    .filter(item => item.type === 'Video')
    .map(item => {
        const original = item.as(YTNodes.Video);
        return toVTVideoDto(original);
    })
    .filter(item => item);
};
