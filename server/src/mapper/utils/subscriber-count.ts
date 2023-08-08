import { parseShortenedNumber } from './shortened-number';

export const parseSubscriberCount = (viewCount: string) => {
  if (viewCount) {
    let views = parseShortenedNumber(viewCount);

    views = views
      .replace(/subscribers?/i, '')
      .replace(',', '')
      .trim();
    return parseInt(views);
  }
};
