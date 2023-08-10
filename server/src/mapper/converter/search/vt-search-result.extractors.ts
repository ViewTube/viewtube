import { YT } from 'youtubei.js';
import { SearchSourceApproximation } from './search-source-approximation';
import { getHandleFromUrl } from 'server/mapper/utils/handle';
import { parseRelativeTime } from 'server/mapper/utils/parse-relative-time';
import { VTSearchVideoResultDto } from 'server/mapper/dto/search/vt-search-video-result.dto';
import { VTSearchChannelResultDto } from 'server/mapper/dto/search/vt-search-channel-result.dto';
import { fixUrl } from 'server/mapper/utils/fix-url';
import { VTSearchShelfDto } from 'server/mapper/dto/search/vt-search-shelf.dto';
import { VTShortsShelfDto } from 'server/mapper/dto/search/vt-shorts-shelf.dto';
import { VTShortDto } from 'server/mapper/dto/vt-short.dto';
import { parseShortenedNumber } from 'server/mapper/utils/shortened-number';
import { parseAccessibilityDuration } from 'server/mapper/utils/accessibility-duration';
import { getTimestampFromSeconds } from 'viewtube/shared';
import { write, writeFileSync } from 'node:fs';
import { VTSearchPlaylistDto } from 'server/mapper/dto/search/vt-search-playlist.dto';
import { VTSearchMovieDto } from 'server/mapper/dto/search/vt-search-movie.dto';

export const extractSearchResults = (searchResults: SearchSourceApproximation[]) => {
  return searchResults.map(result => {
    if (result.type === 'Video') {
      if (result.badges.some(badge => badge.label === 'LIVE')) {
        writeFileSync('live.json', JSON.stringify(result, null, 2));
      }
      return extractSearchVideo(result);
    } else if (result.type === 'Channel') {
      return extractSearchChannel(result);
    } else if (result.type === 'Shelf') {
      return extractSearchShelf(result);
    } else if (result.type === 'ReelShelf') {
      return extractSearchShortsShelf(result);
    } else if (result.type === 'Playlist') {
      return extractSearchPlaylist(result);
    } else if (result.type === 'Movie') {
      return extractSearchMovie(result);
    }
  });
};

const extractSearchMovie = (movie: SearchSourceApproximation) => {
  return {
    type: 'movie',
    id: movie.id,
    title: movie.title?.text,
    description: movie.description_snippet?.text,
    thumbnails: movie.thumbnails?.map(thumbnail => ({
      ...thumbnail,
      url: fixUrl(thumbnail.url)
    })),
    author: {
      id: movie.author?.id,
      name: movie.author?.name,
      isArtist: movie.author?.is_verified_artist,
      isVerified: movie.author?.is_verified
    },
    duration: {
      text: movie.duration?.text,
      seconds: movie.duration?.seconds
    }
  } satisfies VTSearchMovieDto;
};

const extractSearchPlaylist = (playlist: SearchSourceApproximation) => {
  writeFileSync('playlist.json', JSON.stringify(playlist, null, 2));
  return {
    type: 'playlist',
    id: playlist.id,
    title: playlist.title?.text,
    thumbnails: playlist.thumbnails?.map(thumbnail => ({
      ...thumbnail,
      url: fixUrl(thumbnail.url)
    })),
    author: {
      id: playlist.author?.id,
      name: playlist.author?.name,
      thumbnails: playlist.author?.thumbnails.length ? playlist.author?.thumbnails : undefined,
      handle: getHandleFromUrl(playlist.author?.url),
      isArtist: playlist.author?.is_verified_artist,
      isVerified: playlist.author?.is_verified
    },
    videoCount: parseShortenedNumber(playlist.video_count?.text),
    firstVideos: playlist.first_videos.map(item => ({
      id: item.id,
      title: item.title?.text,
      duration: {
        seconds: item.duration?.seconds,
        text: item.duration?.text
      }
    }))
  } satisfies VTSearchPlaylistDto;
};

const extractSearchShortsShelf = (shelf: SearchSourceApproximation) => {
  return {
    type: 'shorts-shelf',
    title: shelf.title?.text,
    items: shelf.items?.map(item => extractSearchShort(item))
  } satisfies VTShortsShelfDto;
};

const extractSearchShelf = (shelf: SearchSourceApproximation) => {
  return {
    type: 'shelf',
    title: shelf.title?.text,
    items: shelf.content?.items?.map(item => extractSearchVideo(item))
  } satisfies VTSearchShelfDto;
};

const extractSearchShort = (short: SearchSourceApproximation['items'][0]) => {
  const duration = parseAccessibilityDuration(short.accessibility_label);
  return {
    type: 'short',
    id: short.id,
    title: short.title?.text,
    duration: {
      seconds: duration,
      text: getTimestampFromSeconds(duration)
    },
    viewCount: parseShortenedNumber(short.views?.text),
    thumbnails: short.thumbnails
  } satisfies VTShortDto;
};

const extractSearchVideo = (video: SearchSourceApproximation) => {
  return {
    type: 'video',
    id: video.id,
    title: video.title?.text,
    description: video.snippets?.[0]?.text?.text,
    thumbnails: video.thumbnails,
    richThumbnails: video.rich_thumbnail,
    author: {
      id: video.author?.id,
      name: video.author?.name,
      thumbnails: video.author?.thumbnails,
      handle: getHandleFromUrl(video.author?.url),
      isArtist: video.author?.is_verified_artist,
      isVerified: video.author?.is_verified
    },
    duration: {
      seconds: video.duration?.seconds,
      text: video.duration?.text
    },
    viewCount: parseShortenedNumber(video.view_count?.text),
    published: {
      date: parseRelativeTime(video.published?.text)?.toDate(),
      text: video.published?.text
    },
    live: video.badges.some(badge => badge.label === 'LIVE')
  } satisfies VTSearchVideoResultDto;
};

const extractSearchChannel = (channel: SearchSourceApproximation) => {
  let subscribers = channel.subscriber_count?.text;
  if (!subscribers?.includes('subscribers')) {
    subscribers = channel.video_count?.text;
  }

  const subscriberCount = parseShortenedNumber(subscribers);

  return {
    type: 'channel',
    id: channel.id,
    name: channel.author?.name,
    description: channel.description_snippet?.text,
    handle: getHandleFromUrl(channel.author?.url),
    subscribers: subscriberCount,
    isArtist: channel.author?.is_verified_artist,
    isVerified: channel.author?.is_verified,
    thumbnails: channel.author?.thumbnails?.map(thumbnail => ({
      ...thumbnail,
      url: fixUrl(thumbnail.url)
    }))
  } satisfies VTSearchChannelResultDto;
};

export const extractEstimatedResultCount = (searchResult: YT.Search) => {
  return searchResult?.estimated_results;
};

export const extractRefinements = (searchResult: YT.Search) => {
  return searchResult?.refinements;
};
