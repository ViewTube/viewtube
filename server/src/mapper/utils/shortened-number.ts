export const parseShortenedNumber = (shortenedNumber: string) => {
  const number = shortenedNumber
    .toString()
    .trim()
    .toLowerCase()
    .replace(/subscribers?/i, '')
    .replace(/views?/i, '');

  let parsedNumber: number;

  if (number.includes('k')) {
    const nr = number.replace('k', '');
    parsedNumber = parseFloat(nr) * 1000;
  } else if (number.includes('m')) {
    const nr = number.replace('m', '');
    parsedNumber = parseFloat(nr) * 1000000;
  } else if (number.includes('b')) {
    const nr = number.replace('b', '');
    parsedNumber = parseFloat(nr) * 1000000000;
  }

  return parsedNumber;
};
