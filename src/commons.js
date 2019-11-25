import InstanceStore from '@/store/instances'

export default {
  autocompleteUrl: 'https://autocomplete.viewtube.eu/',
  description: 'An alternative YouTube frontend using the invidio.us API.',
  language: 'en-US',

  getApiUrl: function () {
    return `${InstanceStore.currentInstance}/api/v1/`
  },

  cleanRedirectUrl: function (string) {
    let urlParams = new URLSearchParams(string.split('?')[1])
    return urlParams.get('q')
  },

  getDomain: function () {
    if (window.location.href.toLowerCase().indexOf('localhost') !== -1) {
      return 'localhost'
    }
    return 'viewtube.eu'
  },

  getOwnApiUrl: function () {
    if (window.location.href.toLowerCase().indexOf('localhost') !== -1) {
      return 'http://localhost:1842/api/'
    }
    return 'https://auth.viewtube.eu/api/'
  },

  getTimestampFromSeconds: seconds => {
    let ms = seconds * 1000
    let date = new Date(ms)
    let timestampHours = toDoubleDigit(date.getHours() - 1)
    let timestampMinutes = toDoubleDigit(date.getMinutes())
    let timestampSeconds = toDoubleDigit(date.getSeconds())
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

  getPageWidth: function () {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    )
  },

  getPageHeight: function () {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    )
  }
}
