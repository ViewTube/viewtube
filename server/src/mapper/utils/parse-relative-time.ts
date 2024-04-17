import type { ManipulateType } from 'dayjs';
import dayjs from 'dayjs';

export const parseRelativeTime = (relativeTime: string) => {
  const regex = /(\d+)\s*(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\s*ago/i;
  const match = relativeTime?.match(regex);

  if (match) {
    const timeValue = parseInt(match[1]);
    const timeUnit = match[2].toLowerCase();

    if (!isNaN(timeValue) && timeUnit) {
      let currentDate = dayjs();
      if (timeUnit.match(/days?|weeks?|months?|years?/i)) {
        currentDate = dayjs().startOf('day');
      }
      return currentDate.subtract(timeValue, timeUnit as ManipulateType);
    }
  }
  return null;
};
