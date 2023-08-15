export type ChannelFeedType = {
  '?xml': {
    encoding: string;
    version: string;
  };
  feed: {
    author: {
      name: string;
      uri: string;
    };
    entry: {
      author: {
        name: string;
        uri: string;
      };
      id: string;
      'media:group': {
        'media:community': {
          'media:starRating': {
            average: string;
            count: string;
            max: string;
            min: string;
          };
          'media:statistics': {
            views: string;
          };
        };
        'media:content': {
          height: string;
          type: string;
          url: string;
          width: string;
        };
        'media:description': string;
        'media:thumbnail': {
          height: string;
          url: string;
          width: string;
        };
        'media:title': string;
      };
      published: string;
      title: string;
      updated: string;
      'yt:channelId': string;
      'yt:videoId': string;
    }[];
    id: string;
    link: [
      {
        href: string;
        rel: 'self';
      },
      {
        href: string;
        rel: 'alternate';
      }
    ];
    published: string;
    title: string;
    xmlns: string;
    'xmlns:media': string;
    'xmlns:yt': string;
    'yt:channelId': string;
  };
};
