import Commons from '@/plugins/commons';

export class SeekbarHelper {
  constructor(seekbar: any) {}

  seekbar: any;
  playerOverlayVisible: any;
  videoElement: any;
  videoRef: any;
  root: any;

  onSeekbarTouchStart(e) {
    if (this.playerOverlayVisible) {
      this.seekbar.seeking = true;
      const touchX = e.touches[0].clientX;
      this.seekbar.seekPercentage = this.calculateSeekPercentage(touchX);
      this.matchSeekProgressPercentage();
      this.seekbar.hoverPercentage = this.calculateSeekPercentage(touchX);
      this.seekbar.hoverTime = this.root.$formatting.getTimestampFromSeconds(
        (this.videoRef.video.duration / 100) * this.seekbar.hoverPercentage
      );
      this.seekbar.hoverTimeStamp =
        (this.videoRef.video.duration / 100) * this.seekbar.hoverPercentage;
    }
  }

  onSeekbarMouseMove(e) {
    this.seekbar.hoverPercentage = this.calculateSeekPercentage(e.pageX);
    this.seekbar.hoverTime = this.root.$formatting.getTimestampFromSeconds(
      (this.videoRef.video.duration / 100) * this.seekbar.hoverPercentage
    );
    this.seekbar.hoverTimeStamp =
      (this.videoRef.video.duration / 100) * this.seekbar.hoverPercentage;
  }

  onSeekbarTouchMove(e) {
    if (this.playerOverlayVisible) {
      const touchX = e.touches[0].clientX;
      this.seekbar.hoverPercentage = this.calculateSeekPercentage(touchX);
      this.seekbar.hoverTime = this.root.$formatting.getTimestampFromSeconds(
        (this.videoRef.video.duration / 100) * this.seekbar.hoverPercentage
      );
      this.seekbar.hoverTimeStamp =
        (this.videoRef.video.duration / 100) * this.seekbar.hoverPercentage;
    }
  }

  onPlayerTouchMove(e) {
    if (this.seekbar.seeking) {
      const touchX = e.touches[0].clientX;
      this.seekbar.seekPercentage = this.calculateSeekPercentage(touchX);
      this.matchSeekProgressPercentage();
    }
  }

  onSeekbarMouseDown() {
    this.seekbar.seeking = true;
  }

  onPlayerMouseUp() {
    if (this.seekbar.seeking) {
      this.seekbar.seeking = false;
      this.matchSeekProgressPercentage(true);
    } else {
      // this.toggleVideoPlayback()
    }
  }

  onSeekbarMouseLeave() {}
  onSeekbarMouseEnter() {}
  onSeekBarClick(e) {
    this.seekbar.seekPercentage = this.calculateSeekPercentage(e.pageX);
    this.matchSeekProgressPercentage(true);
  }

  matchSeekProgressPercentage(adjustVideo: boolean = false) {
    this.videoElement.progressPercentage = this.seekbar.seekPercentage;
    if (adjustVideo && this.videoRef.video) {
      const currentTime = (this.videoRef.video.duration / 100) * this.seekbar.seekPercentage;
      this.videoRef.video.currentTime = currentTime;
    }
  }

  calculateSeekPercentage(pageX: number) {
    const seekPercentage = ((pageX - 10) / (Commons.getPageWidth() - 27.5)) * 100;
    if (seekPercentage > 0 && seekPercentage < 100) {
      return seekPercentage;
    } else if (seekPercentage > 100) {
      return 100;
    } else {
      return 0;
    }
  }

  isMouseOufOfBoundary(pageX: number, pageY: number) {
    return pageX > Commons.getPageWidth() || pageX < 0 || pageY < 0;
  }
}
