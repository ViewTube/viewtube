export default {
  autocompleteUrl: 'https://autocomplete.viewtube.eu/',
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
    if (window.location.href.toLowerCase().indexOf('localhost') !== -1) {
      return 'localhost'
    }
    return 'viewtube.eu'
  },

  getOwnApiUrl() {
    // if (window.location.href.toLowerCase().indexOf('localhost') !== -1) {
    // return 'http://localhost:3030/'
    // }
    return 'https://api.viewtube.eu/'
  },

  getTimestampFromSeconds(seconds) {
    const ms = seconds * 1000
    const date = new Date(ms)
    const timestampHours = toDoubleDigit(date.getHours() - 1)
    const timestampMinutes = toDoubleDigit(date.getMinutes())
    const timestampSeconds = toDoubleDigit(date.getSeconds())
    if (date.getHours() < 1) {
      return `${timestampHours}:${timestampMinutes}:${timestampSeconds}`
    } else {
      return `${timestampMinutes}:${timestampSeconds}`
    }

    function toDoubleDigit(i) {
      if (i < 10) {
        i = '0' + i
      }
      return i
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

  getPageHeight: function () {
    return Math.max(
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    )
  }
}
