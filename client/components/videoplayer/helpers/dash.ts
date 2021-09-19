import { MediaPlayerClass } from 'dashjs';

export class DashHelper {
  constructor(videoRef: any, manifestUrl: string) {
    const dashLibrary = require('dashjs');
    console.log('initializing dash playback');

    this.dashPlayerInstance = dashLibrary.MediaPlayer().create();
    this.videoRef = videoRef;

    // this.dashPlayerInstance.updateSettings({
    //   debug: { logLevel: 5 }
    // });

    this.dashPlayerInstance.initialize(videoRef, manifestUrl, false);
  }

  videoRef: any;
  dashManifest: string;
  dashPlayerInstance: MediaPlayerClass;
  isFullyInitialized = false;

  videoElement: any;

  currentVideoQuality = 0;
  currentAudioQuality = 0;

  renderedVideoQuality = 0;

  registerEventHandlers({ videoElement }: { videoElement: any }) {
    this.videoElement = videoElement;

    this.dashPlayerInstance.on('log', e => {
      console.log(e);
    });

    this.dashPlayerInstance.on('bufferLoaded', () => {
      console.log('buffer loaded');
    });

    this.dashPlayerInstance.on('playbackWaiting', () => {
      this.videoElement.buffering = true;
    });

    this.dashPlayerInstance.on('error', error => {
      console.log(error);
    });

    this.dashPlayerInstance.on('playbackError', error => {
      console.log(error);
    });

    this.dashPlayerInstance.on('qualityChangeRequested', e => {
      if (e.mediaType === 'video') {
        this.currentVideoQuality = e.newQuality;
      } else if (e.mediaType === 'audio') {
        this.currentAudioQuality = e.newQuality;
      }
    });

    this.dashPlayerInstance.on('qualityChangeRendered', e => {
      if (e.mediaType === 'video') {
        this.renderedVideoQuality = e.newQuality;
      }
    });

    this.dashPlayerInstance.on('streamInitialized', () => {
      this.isFullyInitialized = true;
    });
  }

  getVideoQualityList = () => {
    return this.dashPlayerInstance.getBitrateInfoListFor('video');
  };

  getAudioQualityList = () => {
    return this.dashPlayerInstance.getBitrateInfoListFor('audio');
  };

  setVideoQuality = (index: number) => {
    this.dashPlayerInstance.setQualityFor('video', index);
  };

  setAudioQuality = (index: number) => {
    this.dashPlayerInstance.setQualityFor('audio', index);
  };
}
