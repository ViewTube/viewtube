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

  videoElement: any;

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

    this.dashPlayerInstance.on('streamInitialized', () => {
      console.log(this.dashPlayerInstance.getBitrateInfoListFor('video'));
    });
  }
}
