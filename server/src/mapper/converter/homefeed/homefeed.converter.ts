import { toVTVideoDtoList } from 'server/mapper/converter/video/vt-video-node.converter';
import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';

export const toHomeFeed = (homeFeed: { videos?: Array<unknown> }): Array<VTVideoDto> => {
  return toVTVideoDtoList(homeFeed?.videos);
};
