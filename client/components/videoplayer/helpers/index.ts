import { VideoDto } from 'shared';
import { MediaMetadataHelper } from './mediaMetadata';

export class VideoPlayerHelper {
  constructor(video: any, videoRef: any) {
    this.video = video;
    this.videoRef = videoRef;
  }

  video: VideoDto;

  videoRef: any;

  mediaMetadataHelper: MediaMetadataHelper = null;

  public createMediaMetadata() {
    if (!this.mediaMetadataHelper) {
      this.mediaMetadataHelper = new MediaMetadataHelper(this.video);
    }
    return this.mediaMetadataHelper.createMediaMetadata();
  }

  public saveVideoPosition(currentTime: number, store: any) {
    const video = this.videoRef.value.video;
    if (video !== undefined) {
      store.addVideoProgress({
        videoId: this.video.videoId,
        value: currentTime
      });
      // return this.$localforage.setItem(`savedVideoPositionId${videoId}`, value)
    }
  }
}
