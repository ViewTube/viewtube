import { VideoThumbnailDto, VideoDto } from 'viewtube/shared';

declare const MediaMetadata: new (arg0: any) => any;

export class MediaMetadataHelper {
  constructor(video: any) {
    this.video = video;
  }

  video: VideoDto;

  createMediaMetadata() {
    return new MediaMetadata({
      title: this.video.title,
      artist: this.video.author,
      artwork: this.generateArtworkUrl()
    } as any);
  }

  generateArtworkUrl() {
    return this.video.videoThumbnails.map((el: VideoThumbnailDto) => {
      return {
        src: el.url,
        sizes: `${el.height}x${el.width}`,
        type: 'image/jpg'
      };
    });
  }
}
