import { ApiDto } from 'viewtube/shared';

export class MediaMetadataHelper {
  constructor(video: any) {
    this.video = video;
  }

  video: ApiDto<'VideoDto'>;

  createMediaMetadata() {
    return new MediaMetadata({
      title: this.video.title,
      artist: this.video.author,
      artwork: this.generateArtworkUrl()
    } as any);
  }

  generateArtworkUrl() {
    return this.video.videoThumbnails.map((el: ApiDto<'VTThumbnailDto'>) => {
      return {
        src: el.url,
        sizes: `${el.height}x${el.width}`,
        type: 'image/jpg'
      };
    });
  }
}
