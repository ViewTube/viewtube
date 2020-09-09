import X2js from 'x2js';

export default {
  convertFromYoutubeOPMLToJson(opmlString) {
    const x2js = new X2js();
    const jsonString = x2js.xml2js(opmlString);
    console.log(jsonString);

    const channelArray = jsonString.opml.body.outline.outline;
    const mappedChannelArray = this.mapYTChannelArray(channelArray);
    return mappedChannelArray;
  },

  mapYTChannelArray(array) {
    return array.map(element => {
      const channelId = new URL(element._xmlUrl).searchParams.get('channel_id');
      const channelTitle =
        element._title === element._text ? element._title : `${element._title} | ${element._text}`;
      return {
        author: channelTitle,
        authorId: channelId
      };
    });
  }
};
