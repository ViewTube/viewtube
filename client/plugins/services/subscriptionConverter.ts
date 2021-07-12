import X2js from 'x2js';

export default {
  convertFromYoutubeOPMLToJson(opmlString: string) {
    const x2js = new X2js();
    const jsonString: any = x2js.xml2js(opmlString);

    const channelArray = jsonString.opml.body.outline.outline;
    const mappedChannelArray = this.mapYTChannelArray(channelArray);
    return mappedChannelArray;
  },

  mapYTChannelArray(array: any[]) {
    return array.map((element: { _xmlUrl: string; _title: any; _text: any }) => {
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
