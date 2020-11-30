export const getSecondsFromTimestamp = (timestamp: string) => {
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
