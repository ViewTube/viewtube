export default {
  sort_by: 'relevance',
  date: null,
  type: 'video',
  duration: null,
  features: null,
  defaults: {
    sort_by: [
      { name: 'Relevance', value: 'relevance' },
      { name: 'Rating', value: 'rating' },
      { name: 'Upload date', value: 'upload_date' },
      { name: 'View count', value: 'view_count' }
    ],
    date: ['hour', 'today', 'week', 'month', 'year'],
    duration: ['short', 'long'],
    type: ['video', 'playlist', 'channel', 'all'],
    features: ['hd', 'subtitles', 'creative_commons', '3d', 'live', 'purchased', '4k', '360', 'location', 'hdr']
  },
  parseQuery(query) {
    let me = this
    let queryString = ''
    Object.keys(query).forEach((val, i) => {
      if (me.defaults[val]) {
        if (me.defaults[val].includes(query[val])) {
          queryString += `&${val}=${query[val]}`
          me[val] = query[val]
        } else if (me.defaults[val].find(el => el.value === query[val])) {
          queryString += `&${val}=${query[val]}`
          me[val] = query[val]
        }
      }
    })
    return queryString
  },
  getParamsString() {
    console.log(this.parseQuery(this))
    return this.parseQuery(this)
  }
}
