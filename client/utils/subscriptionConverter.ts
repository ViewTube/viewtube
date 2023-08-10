import X2js from 'x2js';
// import PapaParse from 'papaparse';

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

// export const convertFromCSVToJson = (csv: string): Subscription[] => {
  // const result = PapaParse.parse(csv, { header: false, skipEmptyLines: true });
  // result.data.splice(0, 1);
  // if (result.data[0] !== undefined) {
  //   return mapYTTakeout(result.data);
  // }
// };

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
