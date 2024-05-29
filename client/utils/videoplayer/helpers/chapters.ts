import { getSecondsFromTimestamp } from '@viewtube/shared';

export const parseChapters = (description: string, videoLength: number) => {
  if (description.match(/0+:0+/gi)) {
    const timestampMatches = description.matchAll(/((\d{1,2}:)?\d{1,2}:\d{1,2})\s?-?\s?(.*)/gi);

    const chaptersArray = [];

    for (const match of timestampMatches) {
      const second = getSecondsFromTimestamp(match[1]);
      chaptersArray.push({
        title: match[3],
        timestampString: match[1],
        second,
        startPercentage: (second / videoLength) * 100
      });
    }

    return chaptersArray.map((el, index, arr) => {
      let endPercentage = 100;
      if (arr[index + 1]) {
        endPercentage = arr[index + 1].startPercentage;
      }
      return {
        title: el.title,
        timestampString: el.timestampString,
        second: el.second,
        startPercentage: el.startPercentage,
        endPercentage
      };
    });
  }
};
