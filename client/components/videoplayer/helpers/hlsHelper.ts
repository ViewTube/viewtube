import Hls from 'hls.js';

export const initializeHlsStream = (
  streamUrl: string,
  videoRef: HTMLMediaElement,
  proxyUrl: string = ''
): Promise<any> => {
  return new Promise(resolve => {
    const hls = new Hls({
      enableWorker: true,
      backBufferLength: 90,
      xhrSetup(xhr: XMLHttpRequest, url: string) {
        if (proxyUrl) {
          xhr.open('GET', proxyUrl + btoa(url), true);
        } else {
          xhr.open('GET', url, true);
        }
      }
    });
    hls.loadSource(streamUrl);
    hls.attachMedia(videoRef);
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      console.log('media attached');
    });
    hls.on(Hls.Events.MEDIA_ATTACHING, () => {
      console.log('media attaching');
    });
    hls.on(Hls.Events.ERROR, e => {
      console.error(e);
    });
    hls.on(Hls.Events.MANIFEST_PARSED, (e: any) => {
      resolve(e);
    });
  });
};

export const isHlsSupported = (): boolean => {
  return Hls.isSupported();
};

export const isHlsNative = (videoRef: HTMLMediaElement): boolean => {
  return Boolean(videoRef.canPlayType('application/vnd.apple.mpegurl'));
};
