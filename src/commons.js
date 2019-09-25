export default {
  apiUrl: 'https://invidio.us/api/v1/',
  description: 'An alternative YouTube frontend using the invidio.us API.',
  language: 'en-US',
  cleanRedirectUrl: function (string) {
    let urlParams = new URLSearchParams(string.split('?')[1])
    return urlParams.get('q')
  }
}
