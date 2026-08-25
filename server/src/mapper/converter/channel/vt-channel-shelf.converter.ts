import { logger } from 'server/common/logger';
import {
  toVTPlaylistDtoFromLockupView,
  toVTVideoDtoFromLockupView,
  toVTVideoDtoFromShortsLockupView
} from 'server/mapper/converter/lockup/vt-lockup.converter';
import { VTChannelHomeDto } from 'server/mapper/dto/channel/vt-channel-home.dto';
import { VTChannelShelfDto } from 'server/mapper/dto/channel/vt-channel-shelf.dto';
import { VTChannelDto } from 'server/mapper/dto/vt-channel.dto';
import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import { fixUrl } from 'server/mapper/utils/fix-url';
import { getHandleFromUrl } from 'server/mapper/utils/handle';
import { parseRelativeTime } from 'server/mapper/utils/parse-relative-time';
import { parseShortenedNumber } from 'server/mapper/utils/shortened-number';
import { generateVideoThumbnails } from 'server/mapper/utils/video-thumbnails';
import {
  ChannelHomeApproximation,
  ChannelShelfApproximation,
  ChannelShelfItemApproximation,
  ChannelVideoPlayerApproximation,
  GridChannelApproximation
} from './channel-shelf-source-approximation';

const playlistContentTypes = ['PLAYLIST', 'ALBUM', 'SHOW'];

/** Shelves YouTube puts on the home tab that have no place in a video listing. */
const ignoredShelfTypes = ['RecognitionShelf', 'ChannelVideoPlayer'];

const shelfItems = (shelf: ChannelShelfApproximation): Array<ChannelShelfItemApproximation> => {
  return shelf?.content?.items ?? shelf?.items ?? [];
};

const toVTChannelDtoFromGridChannel = (channel: GridChannelApproximation): VTChannelDto | null => {
  const id = channel?.author?.id ?? channel?.id;
  const name = channel?.author?.name;

  if (!id || !name) return null;

  return {
    id,
    name,
    handle: getHandleFromUrl(channel?.author?.endpoint?.payload?.canonicalBaseUrl),
    thumbnails: channel?.author?.thumbnails?.map(thumbnail => ({
      url: fixUrl(thumbnail.url),
      width: thumbnail.width,
      height: thumbnail.height
    })),
    isVerified: channel?.author?.is_verified,
    isArtist: channel?.author?.is_verified_artist,
    subscribers: channel?.subscribers?.text
      ? parseShortenedNumber(channel.subscribers.text)
      : undefined,
    videoCount: channel?.video_count?.text
      ? parseShortenedNumber(channel.video_count.text)
      : undefined
  };
};

export const toVTVideoDtoFromChannelVideoPlayer = (
  player: ChannelVideoPlayerApproximation
): VTVideoDto | null => {
  const id = player?.id;
  const title = player?.title?.text;

  if (!id || !title) return null;

  const publishedText = player?.published_time?.text;

  return {
    id,
    title,
    description: player?.description?.text,
    thumbnails: generateVideoThumbnails(id),
    viewCount: player?.view_count?.text ? parseShortenedNumber(player.view_count.text) : undefined,
    published: publishedText
      ? { text: publishedText, date: parseRelativeTime(publishedText)?.toDate() }
      : undefined
  };
};

/**
 * Shelf item types are not announced by the shelf, so the kind is decided by what it holds.
 */
const toVTChannelShelfDto = (shelf: ChannelShelfApproximation): VTChannelShelfDto | null => {
  const title = shelf?.title?.text;
  const items = shelfItems(shelf);

  if (!title || !items.length) return null;

  if (items.some(item => item?.type === 'GridChannel')) {
    const channels = items
      .filter(item => item?.type === 'GridChannel')
      .map(item => toVTChannelDtoFromGridChannel(item))
      .filter(Boolean);

    return channels.length ? { title, type: 'channels', channels } : null;
  }

  if (items.some(item => item?.type === 'ShortsLockupView' || item?.type === 'ReelItem')) {
    const videos = items.map(item => toVTVideoDtoFromShortsLockupView(item)).filter(Boolean);

    return videos.length ? { title, type: 'shorts', videos } : null;
  }

  const isPlaylistShelf = items.some(
    item => 'content_type' in item && playlistContentTypes.includes(item.content_type)
  );

  if (isPlaylistShelf) {
    const playlists = items.map(item => toVTPlaylistDtoFromLockupView(item)).filter(Boolean);

    return playlists.length ? { title, type: 'playlists', playlists } : null;
  }

  const videos = items.map(item => toVTVideoDtoFromLockupView(item)).filter(Boolean);

  return videos.length ? { title, type: 'videos', videos } : null;
};

export const toVTChannelHomeDto = (home: ChannelHomeApproximation): VTChannelHomeDto => {
  const nodes = (home?.contents ?? []).flatMap(section => section?.contents ?? []);

  const featuredVideoNode = nodes.find(node => node?.type === 'ChannelVideoPlayer');

  const shelves = nodes
    .filter(node => {
      if (ignoredShelfTypes.includes(node?.type)) return false;
      if (node?.type === 'Shelf' || node?.type === 'ReelShelf') return true;

      logger.log(`Unknown channel home shelf type ${node?.type}`);
      return false;
    })
    .map(node => toVTChannelShelfDto(node))
    .filter(Boolean);

  return {
    featuredVideo: featuredVideoNode
      ? toVTVideoDtoFromChannelVideoPlayer(featuredVideoNode)
      : undefined,
    shelves
  };
};
