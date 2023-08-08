export const parseShortenedNumber = (shortenedNumber: string) => {
  let number = shortenedNumber;
  if (number.includes('K')) {
    number = number.replace('K', '000');
  } else if (number.includes('M')) {
    number = number.replace('M', '000000');
  } else if (number.includes('B')) {
    number = number.replace('B', '000000000');
  }

  return number.replace(',', '').trim();
};
