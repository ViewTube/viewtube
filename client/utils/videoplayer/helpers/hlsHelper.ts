import Hls, { type HlsConfig } from 'hls.js';
const { Events } = Hls;

let hls: Hls = null;

export const initializeHlsStream = (
  streamUrl: string,
  videoRef: HTMLMediaElement,
  proxyUrl = ''
): Promise<any> => {
  return new Promise(resolve => {
    if (hls) {
      hls.destroy();
    }
    const hlsOptions: Partial<HlsConfig> = {
      enableWorker: true,
      backBufferLength: 90,
      maxBufferLength: 90,
      // progressive: true,
      fetchSetup(context) {
        if (proxyUrl && !context.url.includes(proxyUrl)) {
          context.url = proxyUrl + encodeURI(context.url);
        }
        return new Request(context.url);
      },
      xhrSetup(xhr: XMLHttpRequest, url: string) {
        if (proxyUrl && !url.includes(proxyUrl)) {
          xhr.open('GET', proxyUrl + encodeURI(url), true);
        } else {
          xhr.open('GET', url, true);
        }
      }
    };
    hls = new Hls(hlsOptions);
    hls.loadSource(streamUrl);
    hls.attachMedia(videoRef);
    hls.on(Events.MEDIA_ATTACHED, () => {
      console.log('media attached');
    });
    hls.on(Events.MEDIA_ATTACHING, () => {
      console.log('media attaching');
    });
    hls.on(Events.ERROR, (...args) => {
      console.error(...args);
    });
    hls.on(Events.MANIFEST_PARSED, (e: any) => {
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
