import { VideoDto } from 'shared';
import { MediaMetadataHelper } from './mediaMetadata';

export class VideoPlayerHelper {
  constructor(video: any) {
    this.video = video;
  }

  video: VideoDto;

  mediaMetadataHelper: MediaMetadataHelper = null;

  public createMediaMetadata() {
    if (!this.mediaMetadataHelper) {
      this.mediaMetadataHelper = new MediaMetadataHelper(this.video);
    }
    return this.mediaMetadataHelper.createMediaMetadata();
  }

  public saveVideoPosition(currentTime: number, store: any) {
    const video = this.$refs.video;
    if (video !== undefined) {
      store.addVideoProgress({
        videoId: this.video.videoId,
        value: currentTime
      });
      // return this.$localforage.setItem(`savedVideoPositionId${videoId}`, value)
    }
  },
}
