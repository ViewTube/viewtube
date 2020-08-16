import xmlJs from 'xml-js'

export default {
  convertFromYoutubeOPMLToJson(opmlString) {
    const jsonString = xmlJs.xml2js(opmlString, { compact: true })

    const channelArray = jsonString.opml.body.outline.outline
    const mappedChannelArray = this.mapYTChannelArray(channelArray)
    return mappedChannelArray
  },

  mapYTChannelArray(array) {
    return array.map(element => {
      const channel = element._attributes
      const channelId = new URL(channel.xmlUrl).searchParams.get('channel_id')
      const channelTitle = channel.title === channel.text ? channel.title : `${channel.title} | ${channel.text}`
      return {
        author: channelTitle,
        authorId: channelId
      }
    })
  }
}