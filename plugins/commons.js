export default {
  autocompleteUrl: 'https://api.viewtube.io/autocomplete/',
  proxyUrl: 'https://proxy.mcdn.ch/index.php?',
  description: 'An alternative YouTube frontend using the Invidious API.',
  language: 'en-US',

  getApiUrl() {
    // return `${this.$store.getters.currentInstance}/api/v1/`
    return 'https://invidio.us/api/v1/'
  },

  getApiUrlNoVersion() {
    // return `${this.$store.getters.currentInstance}/api/`
    return 'https://invidio.us/api/'
  },

  getOwnApiUrl() {
    if (this.isProduction()) {
      return process.env.VIEWTUBE_API_URL || 'https://api.viewtube.io/'
    }
    return 'http://localhost:3030/'
  },

  isProduction() {
    return process.env.NODE_ENV === 'production'
  },

  getProxySrcSet(imgArray) {
    if (Array.isArray(imgArray)) {
      let srcSetString = ''
      imgArray
        .slice()
        .sort((a, b) => a.width - b.width)
        .forEach((element, i) => {
          srcSetString += `${element.url} ${element.width}w`
          if (i + 1 < imgArray.length) {
            srcSetString += ', '
          }
        })
      return srcSetString
    }
  },

  getProxyImageSizes(imgArray) {
    if (Array.isArray(imgArray)) {
      const sortedArray = imgArray.slice().sort((a, b) => a.width - b.width)
      const largerImg = sortedArray[sortedArray.length - 3]
      const desktopImg = sortedArray[3]
      // console.log(largestImg.width)
      return `(max-width: 700px) ${largerImg.width}px, ${desktopImg.width}px`
    }
  },

  getPageWidth() {
    return Math.max(
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    )
  },

  getPageHeight() {
    return Math.max(
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    )
  }
}
