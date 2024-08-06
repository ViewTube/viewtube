import { Sorting } from 'server/common/sorting.type';
import { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';

export class Common {
  public static readonly youtubeVideoUrl: string = 'https://youtube.com/watch?v=';

  public static validateExternalUrl(url: string): boolean {
    return (
      url &&
      url.startsWith('http') &&
      !(
        url.includes('localhost') ||
        url.includes('0.0.0.0') ||
        url.includes('127.0.0.1') ||
        url.startsWith('::1') ||
        url.includes('0:0:0:0:0:0:0:1')
      )
    );
  }

  public static convertSortParams<T>(sort: string): Sorting<T> {
    if (!sort.match(/.*:.*.,?/gi)) return {}
    
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

  public static removeYoutubeFromUrl(url: string): string {
    if (url) {
      return url
        .replace('https://www.youtube.com', '')
        .replace('https://youtube.com', '')
        .replace('http://www.youtube.com', '')
        .replace('http://youtube.com', '');
    }
    return '#';
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

  public static getAuthorThumbnails(url: string): Array<VTThumbnailDto> {
    const regex = /(.*=s)(.*)(-c-k-c.*)/;
    return this.createThumbnailUrls(url, (res: number) => {
      return url.replace(regex, (_, p1, __, p3) => `${p1}${res}${p3}`);
    });
  }

  public static getAuthorThumbnailsForRecommended(url: string): Array<VTThumbnailDto> {
    const regex = /(.*\/s)(.*)(-c-k-no.*)/;
    return this.createThumbnailUrls(url, (res: number) => {
      return url.replace(regex, (_, p1, __, p3) => `${p1}${res}${p3}`);
    });
  }

  public static createThumbnailUrls(
    baseUrl: string,
    replaceFn: (arg0: number) => string
  ): Array<any> {
    if (!baseUrl) return [];

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
  }
}
