import { commons } from '@/plugins/commons';

export const seekbarFunctions = {
  onSeekbarTouchStart(e: any, { playerOverlayVisible, seekbar, videoRef, videoElement, formatFn }) {
    if (playerOverlayVisible.value) {
      seekbar.seeking = true;
      const touchX = e.touches[0].clientX;
      seekbar.seekPercentage = calculateSeekPercentage(touchX);
      matchSeekProgressPercentage(videoRef, seekbar.seekPercentage, videoElement);
      seekbar.hoverPercentage = calculateSeekPercentage(touchX);
      seekbar.hoverTime = formatFn((videoRef.value.duration / 100) * seekbar.hoverPercentage);
      seekbar.hoverTimeStamp = (videoRef.value.duration / 100) * seekbar.hoverPercentage;
    }
  },

  onSeekbarMouseMove(e: any, { seekbar, videoDuration, formatFn }) {
    seekbar.hoverPercentage = calculateSeekPercentage(e.pageX);
    seekbar.hoverTime = formatFn((videoDuration / 100) * seekbar.hoverPercentage);
    seekbar.hoverTimeStamp = (videoDuration / 100) * seekbar.hoverPercentage;
  },

  onSeekbarTouchMove(e: any, { playerOverlayVisible, seekbar, videoDuration, formatFn }) {
    if (playerOverlayVisible.value) {
      const touchX = e.touches[0].clientX;
      seekbar.hoverPercentage = calculateSeekPercentage(touchX);
      seekbar.hoverTime = formatFn((videoDuration / 100) * seekbar.hoverPercentage);
      seekbar.hoverTimeStamp = (videoDuration / 100) * seekbar.hoverPercentage;
    }
  },

  onPlayerTouchMove(e: any, { seekbar, videoRef, seekPercentage, videoElement }) {
    if (seekbar.seeking) {
      const touchX = e.touches[0].clientX;
      seekbar.seekPercentage = calculateSeekPercentage(touchX);
      matchSeekProgressPercentage(videoRef, seekPercentage, videoElement);
    }
  },

  onSeekbarMouseDown({ seekbar }) {
    seekbar.seeking = true;
  },

  onPlayerMouseUp({ seekbar, videoRef, seekPercentage, videoElement }) {
    if (seekbar.seeking) {
      seekbar.seeking = false;
      matchSeekProgressPercentage(videoRef, seekPercentage, videoElement, true);
    } else {
      // toggleVideoPlayback()
    }
  },

  onSeekbarMouseLeave() {},
  onSeekbarMouseEnter() {},
  onSeekBarClick(e: any, { seekbar, videoRef, videoElement }) {
    seekbar.seekPercentage = calculateSeekPercentage(e.pageX);
    matchSeekProgressPercentage(videoRef, seekbar.seekPercentage, videoElement, true);
  },

  isMouseOufOfBoundary(pageX: number, pageY: number) {
    return pageX > commons.getPageWidth() || pageX < 0 || pageY < 0;
  }
};

export function matchSeekProgressPercentage(
  videoRef: any,
  seekPercentage: number,
  videoElement: any,
  adjustVideo: boolean = false
) {
  videoElement.progressPercentage = seekPercentage;
  if (adjustVideo && videoRef.value) {
    const currentTime = (videoRef.value.duration / 100) * seekPercentage;
    videoRef.value.currentTime = currentTime;
  }
}

export function calculateSeekPercentage(pageX: number) {
  const seekPercentage = ((pageX - 10) / (commons.getPageWidth() - 27.5)) * 100;
  if (seekPercentage > 0 && seekPercentage < 100) {
    return seekPercentage;
  } else if (seekPercentage > 100) {
    return 100;
  } else {
    return 0;
  }
}
