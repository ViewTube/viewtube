import { MediaPlayerClass } from 'dashjs';

export class DashHelper {
  constructor(videoRef: any, dashManifest: string) {
    const dashLibrary = require('dashjs');
    console.log('initializing dash playback');

    this.dashPlayerInstance = dashLibrary.MediaPlayer().create();
    this.videoRef = videoRef;

    this.dashPlayerInstance.updateSettings({
      debug: { logLevel: 5 }
    });

    const encodedManifest = `data:application/dash+xml;charset=utf-8;base64,${btoa(dashManifest)}`;

    this.dashPlayerInstance.initialize(videoRef, encodedManifest, false);
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
      console.log('waiting');
      this.videoElement.buffering = true;
    });

    this.dashPlayerInstance.on('error', error => {
      console.log(error);
    });

    this.dashPlayerInstance.on('playbackError', error => {
      console.log(error);
    });
  }
}
