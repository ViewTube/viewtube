export default {
  sort_by: 'relevance',
  date: null,
  type: 'all',
  duration: null,
  features: null,
  page: 1,
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
    page: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    features: ['hd', 'subtitles', 'creative_commons', '3d', 'live', 'purchased', '4k', '360', 'location', 'hdr']
  },
  parseQuery(query) {
    const me = this
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
  parseQueryJson(query, q) {
    const me = this
    const queryObj = {
      q: q || query.search_query
    }
    Object.keys(query).forEach((val, i) => {
      if (me.defaults[val]) {
        if (me.defaults[val].includes(query[val])) {
          queryObj[val] = query[val]
          me[val] = query[val]
        } else if (me.defaults[val].find(el => el.value === query[val])) {
          queryObj[val] = query[val]
          me[val] = query[val]
        }
      }
    })
    return queryObj
  },
  getParamsString() {
    console.log(this.parseQuery(this))
    return this.parseQuery(this)
  },
  getParamsJson(q) {
    return this.parseQueryJson(this, q)
  }
}
