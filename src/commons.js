export default {
  apiUrl: 'https://invidious.snopyta.org/api/v1/',
  language: 'en-US',
  cleanRedirectUrl: function (string) {
    let urlParams = new URLSearchParams(string.split('?')[1])
    return urlParams.get('q')
  }
}
