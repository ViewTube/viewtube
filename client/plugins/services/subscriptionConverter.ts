import X2js from 'x2js';
import PapaParse from 'papaparse';

export default {
  convertFromOPMLToJson(opmlString: string) {
    const x2js = new X2js();
    const jsonString: any = x2js.xml2js(opmlString);

    if (jsonString.opml !== undefined) {
      const channelArray = jsonString.opml.body.outline.outline;
      const mappedChannelArray = this.mapOMPL(channelArray);
      return mappedChannelArray;
    }
  },

  convertFromCSVToJson(csvString: string) {
    const result = PapaParse.parse(csvString, { header: false, skipEmptyLines: true });
    result.data.splice(0, 1);
    if (result.data[0] !== undefined) {
      return this.mapYTTakeout(result.data);
    }
  },

  mapOMPL(array: any[]) {
    return array.map((element: { _xmlUrl: string; _title: any; _text: any }) => {
      let channelId = new URL(element._xmlUrl).searchParams.get('channel_id');
      if (!channelId) {
        channelId = element._xmlUrl.match(/(.*\/channel\/)(.*[^\\/])\/?/i)[2];
      }
      const channelTitle =
        element._title === element._text ? element._title : `${element._title} | ${element._text}`;
      return {
        author: channelTitle,
        authorId: channelId,
        selected: false
      };
    });
  },

  mapYTTakeout(array: any[]) {
    return array.map((element: Object) => {
      return {
        author: element[2],
        authorId: element[0],
        selected: false
      };
    });
  }
};
