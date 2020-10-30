import Commons from '@/plugins/commons';

export class SeekbarHelper {
  public constructor(env: {
    seekbar: any;
    playerOverlayVisible: any;
    videoElement: any;
    videoRef: any;
    root: any;
  }) {
    this.seekbar = env.seekbar;
    this.playerOverlayVisible = env.playerOverlayVisible;
    this.videoElement = env.videoElement;
    this.videoRef = env.videoRef;
    this.root = env.root;
  }

  seekbar: any;
  playerOverlayVisible: any;
  videoElement: any;
  videoRef: any;
  root: any;

  public onSeekbarTouchStart(e: any) {
    if (this.playerOverlayVisible.value) {
      this.seekbar.seeking = true;
      const touchX = e.touches[0].clientX;
      this.seekbar.seekPercentage = this.calculateSeekPercentage(touchX);
      this.matchSeekProgressPercentage();
      this.seekbar.hoverPercentage = this.calculateSeekPercentage(touchX);
      this.seekbar.hoverTime = this.root.$formatting.getTimestampFromSeconds(
        (this.videoRef.value.duration / 100) * this.seekbar.hoverPercentage
      );
      this.seekbar.hoverTimeStamp =
        (this.videoRef.value.duration / 100) * this.seekbar.hoverPercentage;
    }
  }

  public onSeekbarMouseMove(e) {
    this.seekbar.hoverPercentage = this.calculateSeekPercentage(e.pageX);
    this.seekbar.hoverTime = this.root.$formatting.getTimestampFromSeconds(
      (this.videoRef.value.duration / 100) * this.seekbar.hoverPercentage
    );
    this.seekbar.hoverTimeStamp =
      (this.videoRef.value.duration / 100) * this.seekbar.hoverPercentage;
  }

  public onSeekbarTouchMove(e) {
    if (this.playerOverlayVisible.value) {
      const touchX = e.touches[0].clientX;
      this.seekbar.hoverPercentage = this.calculateSeekPercentage(touchX);
      this.seekbar.hoverTime = this.root.$formatting.getTimestampFromSeconds(
        (this.videoRef.value.duration / 100) * this.seekbar.hoverPercentage
      );
      this.seekbar.hoverTimeStamp =
        (this.videoRef.value.duration / 100) * this.seekbar.hoverPercentage;
    }
  }

  public onPlayerTouchMove(e) {
    if (this.seekbar.seeking) {
      const touchX = e.touches[0].clientX;
      this.seekbar.seekPercentage = this.calculateSeekPercentage(touchX);
      this.matchSeekProgressPercentage();
    }
  }

  public onSeekbarMouseDown() {
    this.seekbar.seeking = true;
  }

  public onPlayerMouseUp() {
    if (this.seekbar.seeking) {
      this.seekbar.seeking = false;
      this.matchSeekProgressPercentage(true);
    } else {
      // this.toggleVideoPlayback()
    }
  }

  public onSeekbarMouseLeave() {}
  public onSeekbarMouseEnter() {}
  public onSeekBarClick(e) {
    this.seekbar.seekPercentage = this.calculateSeekPercentage(e.pageX);
    this.matchSeekProgressPercentage(true);
  }

  public matchSeekProgressPercentage(adjustVideo: boolean = false) {
    this.videoElement.progressPercentage = this.seekbar.seekPercentage;
    if (adjustVideo && this.videoRef.value) {
      const currentTime = (this.videoRef.value.duration / 100) * this.seekbar.seekPercentage;
      this.videoRef.value.currentTime = currentTime;
    }
  }

  public calculateSeekPercentage(pageX: number) {
    const seekPercentage = ((pageX - 10) / (Commons.getPageWidth() - 27.5)) * 100;
    if (seekPercentage > 0 && seekPercentage < 100) {
      return seekPercentage;
    } else if (seekPercentage > 100) {
      return 100;
    } else {
      return 0;
    }
  }

  public isMouseOufOfBoundary(pageX: number, pageY: number) {
    return pageX > Commons.getPageWidth() || pageX < 0 || pageY < 0;
  }
}
