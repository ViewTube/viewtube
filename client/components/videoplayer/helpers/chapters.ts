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

const getSecondsFromTimestamp = (timestamp: string) => {
  const timeStrings = timestamp.split(':');
  const reverseTimeStrings = timeStrings.reverse();
  let seconds = 0;

  if (reverseTimeStrings.length > 0) {
    seconds += parseInt(reverseTimeStrings[0]);
  }
  if (reverseTimeStrings.length > 1) {
    seconds += parseInt(reverseTimeStrings[1]) * 60;
  }
  if (reverseTimeStrings.length > 2) {
    seconds += parseInt(reverseTimeStrings[2]) * 3600;
  }

  return seconds;
};
