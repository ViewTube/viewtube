import { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';
import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import { getHandleFromUrl } from 'server/mapper/utils/handle';
import { parseRelativeTime } from 'server/mapper/utils/parse-relative-time';
import { parseShortenedNumber } from 'server/mapper/utils/shortened-number';
import { getSecondsFromTimestamp, getTimestampFromSeconds } from 'viewtube/shared';
import Author from 'youtubei.js/dist/src/parser/classes/misc/Author';
import { VideoSourceApproximation } from './vt-video.converter';

export const extractVideoId = (video: VideoSourceApproximation): string => {
  if (video.id) {
    return video.id;
  } else if (video.videoId) {
    return video.videoId;
  } else if (video.videoID) {
    return video.videoID;
  }
};

export const extractVideoTitle = (video: VideoSourceApproximation): string => {
  if (typeof video.title === 'object') {
    if (video.title) {
      return (video.title as { text: string }).text;
    }
  } else if (typeof video.title === 'string') {
    return video.title;
  } else if (video.name) {
    return video.name;
  } else {
    return null;
  }
};

export const extractVideoAuthor = (video: VideoSourceApproximation): VTVideoDto['author'] => {
  let id: string;
  let name: string;
  let thumbnails: Array<VTThumbnailDto>;
  let isVerified: boolean;
  let isArtist: boolean;
  let handle: string;

  if (video.author) {
    if (typeof video.author === 'string') {
      name = video.author;
    } else if (typeof video.author === 'object') {
      const authorObj = video.author as Author & { text?: string };
      if (authorObj.name) {
        name = authorObj.name;
      } else if (authorObj.text) {
        name = authorObj.text;
      }

      if (authorObj.id) {
        id = authorObj.id;
      }

      if (typeof authorObj.is_verified === 'boolean' || authorObj.is_verified === null) {
        isVerified = !!authorObj.is_verified;
      }

      if (
        typeof authorObj.is_verified_artist === 'boolean' ||
        authorObj.is_verified_artist === null
      ) {
        isArtist = !!authorObj.is_verified_artist;
      }

      if (authorObj.thumbnails) {
        thumbnails = authorObj.thumbnails.map(thumbnail => {
          return {
            url: thumbnail.url,
            width: thumbnail.width,
            height: thumbnail.height
          };
        });
      }

      if (authorObj.url) {
        handle = getHandleFromUrl(authorObj.url);
      }
    }
  }

  if (video.authorId) {
    id = video.authorId;
  }

  if (video.authorThumbnails) {
    thumbnails = video.authorThumbnails.map(thumbnail => {
      return {
        url: thumbnail.url,
        width: thumbnail.width,
        height: thumbnail.height
      };
    });
  } else if (video.authorThumbnailUrl) {
    const dimensions = video.authorThumbnailUrl.match(/s(\d{2,3})-/i)?.[1];
    let widthHeight = 68;
    try {
      widthHeight = dimensions ? parseInt(dimensions) : 68;
    } catch {
      // Ignore
    }

    thumbnails = [
      {
        url: video.authorThumbnailUrl,
        width: widthHeight,
        height: widthHeight
      }
    ];
  }

  if (typeof video.authorVerified === 'boolean' || video.authorVerified === null) {
    isVerified = video.authorVerified;
  }

  if (typeof video.authorArtist === 'boolean' || video.authorArtist === null) {
    isArtist = video.authorArtist;
  }

  if (video.authorUrl) {
    handle = getHandleFromUrl(video.authorUrl);
  }

  if (id && name) {
    return {
      id,
      name,
      thumbnails,
      isVerified,
      isArtist,
      handle
    };
  }
};

export const extractVideoDescription = (video: VideoSourceApproximation): string => {
  if (video.description) {
    return video.description;
  } else if (video.descriptionHtml) {
    return video.descriptionHtml;
  } else if (video.description_snippet) {
    return video.description_snippet?.text;
  } else if (video.snippets) {
    const possibleDescription = video.snippets.find(snip =>
      snip.hover_text?.text?.includes('description')
    );
    if (possibleDescription?.text?.text) {
      return possibleDescription.text.text;
    }
  }
};

export const extractVideoRichThumbnails = (
  video: VideoSourceApproximation
): Array<VTThumbnailDto> => {
  if (video.rich_thumbnail) {
    const thumbnails = video.rich_thumbnail as unknown as Array<VTThumbnailDto>;
    return thumbnails.map(thumbnail => {
      return {
        url: thumbnail.url,
        width: thumbnail.width,
        height: thumbnail.height
      };
    });
  }
};

export const extractVideoDuration = (video: VideoSourceApproximation): VTVideoDto['duration'] => {
  let seconds: number;
  let text: string;

  if (video.lengthSeconds || typeof video.lengthSeconds === 'number') {
    seconds = parseInt(video.lengthSeconds.toString());
  } else if (video.lengthString) {
    seconds = getSecondsFromTimestamp(video.lengthString);
  }

  if (video.lengthString) {
    text = video.lengthString;
  } else if (video.lengthSeconds || typeof video.lengthSeconds === 'number') {
    text = getTimestampFromSeconds(seconds);
  }

  if (video.duration) {
    seconds = video.duration.seconds;
    text = video.duration.text;
  }

  return {
    seconds,
    text
  };
};

export const extractVideoPublished = (video: VideoSourceApproximation): VTVideoDto['published'] => {
  if (video.published) {
    return {
      date: parseRelativeTime(video.published.text)?.toDate(),
      text: video.published.text
    };
  } else if (video.publishedText) {
    return {
      date: parseRelativeTime(video.publishedText)?.toDate(),
      text: video.publishedText
    };
  }
};

export const extractVideoViewCount = (video: VideoSourceApproximation): number => {
  let viewCountString: string;

  if (video.viewCount) {
    viewCountString = video.viewCount;
  } else if (video.view_count) {
    viewCountString = video.view_count.text;
  }

  if (viewCountString) {
    return parseShortenedNumber(viewCountString);
  }
};

export const extractVideoUpcoming = (video: VideoSourceApproximation): Date => {
  if (video.upcoming) {
    return new Date(video.upcoming);
  }
};

export const extractVideoLive = (video: VideoSourceApproximation): boolean => {
  if (typeof video.live === 'boolean') {
    return video.live;
  } else if (typeof video.isLive === 'boolean') {
    return video.isLive;
  } else if (typeof video.is_live === 'boolean') {
    return video.is_live;
  } else if (video.badges) {
    return video.badges.some(
      badge => badge.label === 'LIVE' || badge.style === 'BADGE_STYLE_TYPE_LIVE_NOW'
    );
  }
};
