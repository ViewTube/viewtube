import { Logger } from '@nestjs/common';
import { getSecondsFromTimestamp } from '@viewtube/shared';
import {
  toVTVideoDtoFromLockupView,
  toVTVideoDtoFromShortsLockupView
} from 'server/mapper/converter/lockup/vt-lockup.converter';
import { toVTVideoDtoFromMusicItem } from 'server/mapper/converter/music/vt-music-item.converter';
import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import { toVTVideoDto, VideoSourceApproximation } from './vt-video.converter';

const logger = new Logger('VideoNodeConverter');

/**
 * GridVideo keeps its duration as plain text and its view count as `views`, so it has to be
 * normalized before the regular video extractors can read it.
 */
const gridVideoToSource = (node: any): VideoSourceApproximation => {
  const durationText = node?.duration?.text;

  return {
    id: node?.video_id,
    title: node?.title,
    author: node?.author,
    duration: durationText
      ? { text: durationText, seconds: getSecondsFromTimestamp(durationText) }
      : undefined,
    published: node?.published,
    view_count: node?.views ?? node?.short_view_count,
    rich_thumbnail: node?.rich_thumbnail,
    upcoming: node?.upcoming
  } as VideoSourceApproximation;
};

/**
 * YouTube returns videos as a growing set of node types, feeds mix them freely.
 * Everything that can be shown as a video entry is mapped to a VTVideoDto here.
 */
export const toVTVideoDtoFromNode = (node: any): VTVideoDto | null => {
  switch (node?.type) {
    case 'Video':
    case 'CompactVideo':
    case 'PlaylistVideo':
    case 'PlaylistPanelVideo':
    case 'WatchCardCompactVideo':
      return toVTVideoDto(node);
    case 'GridVideo':
      return toVTVideoDto(gridVideoToSource(node));
    case 'LockupView':
      return toVTVideoDtoFromLockupView(node);
    // Channel and home feeds wrap their entries, the entry itself is what carries the video
    case 'RichItem':
      return toVTVideoDtoFromNode(node?.content);
    case 'ShortsLockupView':
    case 'ReelItem':
      return toVTVideoDtoFromShortsLockupView(node);
    // Feeds mix videos with shelves and continuations, those are not video entries
    case 'ReelShelf':
    case 'Shelf':
    case 'RichShelf':
    case 'RichSection':
    case 'ContinuationItem':
      return null;
    case 'MusicResponsiveListItem':
    case 'MusicTwoRowItem':
      return toVTVideoDtoFromMusicItem(node);
    default:
      logger.log(`Unknown video node type ${node?.type}`);
      return null;
  }
};

export const toVTVideoDtoList = (nodes: Array<unknown>): Array<VTVideoDto> => {
  return (nodes ?? []).map(node => toVTVideoDtoFromNode(node)).filter(video => video?.id);
};
