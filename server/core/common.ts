import { AuthorThumbnailDto } from "./videos/dto/author-thumbnail.dto";
import { VideoThumbnailDto } from "./videos/dto/video-thumbnail.dto";

export class Common {
  public static readonly youtubeVideoUrl: string =
    'https://youtube.com/watch?v=';

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

  public static getVideoThumbnails(id: string): Array<VideoThumbnailDto> {
    return [
      {
        quality: 'maxres',
        url: `https://invidio.us/vi/${id}/maxres.jpg`,
        width: 1280,
        height: 720,
      },
      {
        quality: 'maxresdefault',
        url: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        width: 1280,
        height: 720,
      },
      {
        quality: 'sddefault',
        url: `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
        width: 640,
        height: 480,
      },
      {
        quality: 'high',
        url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        width: 480,
        height: 360,
      },
      {
        quality: 'medium',
        url: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
        width: 320,
        height: 180,
      },
      {
        quality: 'default',
        url: `https://i.ytimg.com/vi/${id}/default.jpg`,
        width: 120,
        height: 90,
      },
      {
        quality: 'start',
        url: `https://i.ytimg.com/vi/${id}/1.jpg`,
        width: 120,
        height: 90,
      },
      {
        quality: 'middle',
        url: `https://i.ytimg.com/vi/${id}/2.jpg`,
        width: 120,
        height: 90,
      },
      {
        quality: 'end',
        url: `https://i.ytimg.com/vi/${id}/3.jpg`,
        width: 120,
        height: 90,
      },
    ];
  }

  public static getAuthorThumbnails(url: string): Array<AuthorThumbnailDto> {
    const regex = /(.*=s)(.*)(-c-k-c.*)/;
    return this.createThumbnailUrls(url, (res: number) => {
      return url.replace(regex, (_, p1, p2, p3) => `${p1}${res}${p3}`);
    });
  }

  public static getAuthorThumbnailsForRecommended(url: string): Array<AuthorThumbnailDto> {
    const regex = /(.*\/s)(.*)(-c-k-no.*)/;
    return this.createThumbnailUrls(url, (res: number) => {
      return url.replace(regex, (_, p1, p2, p3) => `${p1}${res}${p3}`);
    });
  }

  public static createThumbnailUrls(baseUrl: string, replaceFn: Function) {
    if (baseUrl) {
      return [
        {
          url: replaceFn(32),
          width: 32,
          height: 32,
        },
        {
          url: replaceFn(48),
          width: 48,
          height: 48,
        },
        {
          url: replaceFn(76),
          width: 76,
          height: 76,
        },
        {
          url: replaceFn(100),
          width: 100,
          height: 100,
        },
        {
          url: replaceFn(176),
          width: 176,
          height: 176,
        },
        {
          url: replaceFn(512),
          width: 512,
          height: 512,
        },
      ];
    } else {
      return [];
    }
  }
}
