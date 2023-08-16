import X2js from 'x2js';
import PapaParse from 'papaparse';

type Subscription = {
  author: string;
  authorId: string;
  selected: boolean;
};

export const convertFromOPMLToJson = (opml: string): Subscription[] => {
  const x2js = new X2js();
  const jsonString: any = x2js.xml2js(opml);

  if (jsonString.opml !== undefined) {
    const channelArray: Object[] = jsonString.opml.body.outline.outline;
    const mappedChannelArray = mapOPML(channelArray);
    return mappedChannelArray;
  } 
};

export const convertFromInternalToOPML = (subscriptions: Subscription[]): string => {
  const x2js = new X2js();
  const channelArray = subscriptions.map((subscription: Subscription) => {
    if(subscription.author.includes('|')) {
      const authorArray = subscription.author.split('|');
      return {
        _text: authorArray[0],
        _title: authorArray[1],
        _type: 'rss',
        _xmlUrl: `https://www.youtube.com/feeds/videos.xml?channel_id=${subscription.authorId}`
      };
    }
    return {
      _text: subscription.author,
      _title: subscription.author,
      _type: 'rss',
      _xmlUrl: `https://www.youtube.com/feeds/videos.xml?channel_id=${subscription.authorId}`
    };
  });
  const jsonObject = {
    opml: {
      body: {
        outline: {
          outline: channelArray
        }
      }
    }
  };
  const xml = x2js.js2xml(jsonObject);
  console.log(xml)
  return xml;
};

export const convertFromCSVToJson = (csv: string): Subscription[] => {
  const result = PapaParse.parse(csv, { header: false, skipEmptyLines: true });
  result.data.splice(0, 1);
  if (result.data[0] !== undefined) {
    return mapYTTakeout(result.data);
  }
};

export const convertJSONToInternal = (json: string): Subscription[] => {
  const parsedJson = JSON.parse(json);
  if(parsedJson.subscriptions === undefined) { //VT internal format
    return parsedJson.map((element: { author: string; authorId: string }) => {
      return {
        author: element.author,
        authorId: element.authorId,
        selected: false
      };
    });
  }
  return parsedJson.subscriptions.map((element: { url: string; name: string }) => { 
    return {  
      author: element.name,
      authorId: element.url.match(/(.*\/channel\/)(.*[^\\/])\/?/i)[2],
      selected: false
    };
  });
};

export const mapYTTakeout = (data: any[]): Subscription[] => {
  return data.map((element: Object) => {
    return {
      author: element[2],
      authorId: element[0],
      selected: false
    };
  });
};

export const mapOPML = (opml: Object[]): Subscription[] =>
  opml.map((row: { _xmlUrl: string; _title: any; _text: any }) => {
    const author = row._title === row._text ? row._title : `${row._title} | ${row._text}`;
    let authorId = new URL(row._xmlUrl).searchParams.get('channel_id');
    if (!authorId) {
      authorId = row._xmlUrl.match(/(.*\/channel\/)(.*[^\\/])\/?/i)[2];
    }
    return {
      author,
      authorId,
      selected: false
    };
  });
