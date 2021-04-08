import Hls from 'hls.js';

let hls: Hls = null;

export const initializeHlsStream = (
  streamUrl: string,
  videoRef: HTMLMediaElement,
  proxyUrl: string = ''
): Promise<any> => {
  return new Promise(resolve => {
    if (hls) {
      hls.destroy();
    }
    const proxiedStreamUrl = proxyUrl + btoa(streamUrl);
    hls = new Hls({
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
    hls.loadSource(proxiedStreamUrl);
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

export const destroyInstance = (): void => {
  if (hls) {
    hls.destroy();
  }
};

export const isHlsSupported = (): boolean => {
  return Hls.isSupported();
};

export const isHlsNative = (videoRef: HTMLMediaElement): boolean => {
  return Boolean(videoRef.canPlayType('application/vnd.apple.mpegurl'));
};
