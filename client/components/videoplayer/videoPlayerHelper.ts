export class VideoPlayerHelper {
  constructor(video: any) {
    this.video = video;
  }

  video: any;

  createMediaMetadata() {
    // @ts-ignore
    // eslint-disable-next-line no-undef
    return new MediaMetadata({
      title: this.video.title,
      artist: this.video.author,
      artwork: this.generateArtworkUrl()
    } as any);
  }

  generateArtworkUrl() {
    return this.video.videoThumbnails.map((el: { url: string; height: number; width: number }) => {
      return {
        src: el.url,
        sizes: `${el.height}x${el.width}`,
        type: 'image/jpg'
      };
    });
  }
}
