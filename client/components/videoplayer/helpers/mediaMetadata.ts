import { ApiSchema, ApiDto } from 'viewtube/shared';

export class MediaMetadataHelper {
  constructor(video: any) {
    this.video = video;
  }

  video: ApiSchema['VideoDto'];

  video2: ApiDto<'VideoDto'>;

  createMediaMetadata() {
    return new MediaMetadata({
      title: this.video.title,
      artist: this.video.author,
      artwork: this.generateArtworkUrl()
    } as any);
  }

  generateArtworkUrl() {
    return this.video.videoThumbnails.map((el: ApiSchema['VideoThumbnailDto']) => {
      return {
        src: el.url,
        sizes: `${el.height}x${el.width}`,
        type: 'image/jpg'
      };
    });
  }
}
