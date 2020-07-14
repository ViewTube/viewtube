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

  getDomain() {
    if (window.location.href.toLowerCase().includes('localhost')) {
      return 'localhost'
    }
    return 'viewtube.io'
  },

  getOwnApiUrl() {
    // if (window.location.href.toLowerCase().indexOf('localhost') !== -1) {
    return 'http://localhost:3030/'
    // }
    // console.log(process.env.API_URL, process.env.VIEWTUBE_API_URL)
    // return process.env.VIEWTUBE_API_URL || 'https://api.viewtube.io/'
    // return 'https://proxy.mcdn.ch/index.php?https://api.viewtube.io/'
  },

  getProxySrcSet(imgArray) {
    if (Array.isArray(imgArray)) {
      let srcSetString = ''

      imgArray.slice().sort((a, b) => a.width - b.width).forEach((element, i) => {
        srcSetString += `${element.url} ${element.width}w`
        if ((i + 1) < imgArray.length) {
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
