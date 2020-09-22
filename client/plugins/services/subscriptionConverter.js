import X2js from 'x2js';

export default {
  convertFromYoutubeOPMLToJson(opmlString) {
    const x2js = new X2js();
    const jsonString = x2js.xml2js(opmlString);

    const channelArray = jsonString.opml.body.outline.outline;
    const mappedChannelArray = this.mapYTChannelArray(channelArray);
    return mappedChannelArray;
  },

  mapYTChannelArray(array) {
    return array.map(element => {
      let channelId = new URL(element._xmlUrl).searchParams.get('channel_id');
      if (!channelId) {
        channelId = element._xmlUrl.match(/(.*\/channel\/)(.*[^\\/])\/?/i)[2];
      }
      const channelTitle =
        element._title === element._text ? element._title : `${element._title} | ${element._text}`;
      return {
        author: channelTitle,
        authorId: channelId
      };
    });
  }
};
