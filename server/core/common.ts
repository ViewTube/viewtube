import { Sorting } from 'server/common/sorting.type';
import { VideoThumbnailDto } from 'viewtube/shared/dto/video/video-thumbnail.dto';
import { AuthorThumbnailDto } from '../../shared/dto/video/author-thumbnail.dto';

export class Common {
  public static readonly youtubeVideoUrl: string = 'https://youtube.com/watch?v=';

  public static convertSortParams<T>(sort: string): Sorting<T> {
    if (sort.match(/.*:.*.,?/gi)) {
      const sortArray = sort.split(',');
      const sorting: Sorting<T> = {};
      sortArray.forEach(el => {
        if (el.match(/.*:.*./gi)) {
          const [prop, val] = el.split(':');
          const propVal = parseInt(val);
          sorting[prop] = propVal;
        }
      });
      return sorting;
    }
    return {};
  }

  public static removeYoutubeFromUrl(url: string): string {
    if (url) {
      return url
        .replace('https://www.youtube.com', '')
        .replace('https://youtube.com', '')
        .replace('http://www.youtube.com', '')
        .replace('http://youtube.com', '');
    } else {
      return '#';
    }
  }

  public static getPlaylistIdFromUrl(playlistUrl: string): string {
    return playlistUrl.replace('PL4o29bINVT4EG_y-k5jGoOu3-Am8Nvi10', '');
  }

  public static getChannelIdFromUrl(channelUrl: string): string {
    return channelUrl
      .replace('https://www.youtube.com/user/', '')
      .replace('https://www.youtube.com/channel/', '')
      .replace('/', '');
  }

  public static getVideoIdFromUrl(videoUrl: string): string {
    return videoUrl.replace('https://www.youtube.com/watch?v=', '');
  }

  public static getVideoThumbnails(id: string): Array<VideoThumbnailDto> {
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
  }

  public static getAuthorThumbnails(url: string): Array<AuthorThumbnailDto> {
    const regex = /(.*=s)(.*)(-c-k-c.*)/;
    return this.createThumbnailUrls(url, (res: number) => {
      return url.replace(regex, (_, p1, __, p3) => `${p1}${res}${p3}`);
    });
  }

  public static getAuthorThumbnailsForRecommended(url: string): Array<AuthorThumbnailDto> {
    const regex = /(.*\/s)(.*)(-c-k-no.*)/;
    return this.createThumbnailUrls(url, (res: number) => {
      return url.replace(regex, (_, p1, __, p3) => `${p1}${res}${p3}`);
    });
  }

  public static createThumbnailUrls(
    baseUrl: string,
    replaceFn: (arg0: number) => string
  ): Array<any> {
    if (baseUrl) {
      return [
        {
          url: replaceFn(32),
          width: 32,
          height: 32
        },
        {
          url: replaceFn(48),
          width: 48,
          height: 48
        },
        {
          url: replaceFn(76),
          width: 76,
          height: 76
        },
        {
          url: replaceFn(100),
          width: 100,
          height: 100
        },
        {
          url: replaceFn(176),
          width: 176,
          height: 176
        },
        {
          url: replaceFn(512),
          width: 512,
          height: 512
        }
      ];
    } else {
      return [];
    }
  }
}
