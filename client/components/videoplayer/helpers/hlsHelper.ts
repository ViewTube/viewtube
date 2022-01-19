import Hls, { HlsConfig } from 'hls.js/dist/hls.js.d';

const HlsLibrary = require('hls.js/dist/hls.light.min');
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
    const hlsOptions: Partial<HlsConfig> = {
      enableWorker: true,
      backBufferLength: 90,
      xhrSetup(xhr: XMLHttpRequest, url: string) {
        if (proxyUrl) {
          xhr.open('GET', proxyUrl + btoa(url), true);
        } else {
          xhr.open('GET', url, true);
        }
      }
    };
    hls = new HlsLibrary(hlsOptions);
    hls.loadSource(proxiedStreamUrl);
    hls.attachMedia(videoRef);
    hls.on(HlsLibrary.Events.MEDIA_ATTACHED, () => {
      console.log('media attached');
    });
    hls.on(HlsLibrary.Events.MEDIA_ATTACHING, () => {
      console.log('media attaching');
    });
    hls.on(HlsLibrary.Events.ERROR, e => {
      console.error(e);
    });
    hls.on(HlsLibrary.Events.MANIFEST_PARSED, (e: any) => {
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
  return HlsLibrary.isSupported();
};

export const isHlsNative = (videoRef: HTMLMediaElement): boolean => {
  return Boolean(videoRef.canPlayType('application/vnd.apple.mpegurl'));
};
