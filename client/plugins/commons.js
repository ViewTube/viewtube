export default {
  autocompleteUrl: 'https://viewtube.io/api/autocomplete/',
  proxyUrl: 'https://proxy.mcdn.ch/index.php?',
  description: 'An alternative YouTube frontend using the Invidious API.',
  language: 'en-US',

  getApiUrl() {
    // return `${this.$store.getters.currentInstance}/api/v1/`
    return 'https://invidious.snopyta.org/api/v1/';
  },

  getApiUrlNoVersion() {
    // return `${this.$store.getters.currentInstance}/api/`
    return 'https://invidious.snopyta.org/api/';
  },

  getOwnApiUrl() {
    if (this.isProduction()) {
      return process.env.apiUrl || '/api/';
    }
    return 'http://localhost:8066/api/';
  },

  getVideoIdFromUrl(videoUrl) {
    return videoUrl.replace('https://www.youtube.com/watch?v=', '');
  },

  getVAPIDKey() {
    const key = process.env.VAPID_KEY;
    if (key) {
      this.urlBase64ToUint8Array();
    } else {
      console.log('no VAPID public key found');
    }
  },

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  isProduction() {
    return process.env.NODE_ENV === 'production';
  },

  getProxySrcSet(imgArray) {
    if (Array.isArray(imgArray)) {
      let srcSetString = '';
      imgArray
        .slice()
        .sort((a, b) => a.width - b.width)
        .forEach((element, i) => {
          srcSetString += `${element.url} ${element.width}w`;
          if (i + 1 < imgArray.length) {
            srcSetString += ', ';
          }
        });
      return srcSetString;
    }
  },

  getProxyImageSizes(imgArray) {
    if (Array.isArray(imgArray)) {
      const sortedArray = imgArray.slice().sort((a, b) => a.width - b.width);
      const largerImg = sortedArray[sortedArray.length - 3];
      const desktopImg = sortedArray[3];
      // console.log(largestImg.width)
      return `(max-width: 700px) ${largerImg.width}px, ${desktopImg.width}px`;
    }
  },

  getPageWidth() {
    return Math.max(
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  },

  getPageHeight() {
    return Math.max(
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
  }
};
