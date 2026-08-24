import dayjs, { ManipulateType } from 'dayjs';

const unitAliases: Record<string, ManipulateType> = {
  s: 'second',
  sec: 'second',
  secs: 'second',
  second: 'second',
  seconds: 'second',
  m: 'minute',
  min: 'minute',
  mins: 'minute',
  minute: 'minute',
  minutes: 'minute',
  h: 'hour',
  hr: 'hour',
  hrs: 'hour',
  hour: 'hour',
  hours: 'hour',
  d: 'day',
  day: 'day',
  days: 'day',
  w: 'week',
  wk: 'week',
  wks: 'week',
  week: 'week',
  weeks: 'week',
  mo: 'month',
  mon: 'month',
  mos: 'month',
  month: 'month',
  months: 'month',
  y: 'year',
  yr: 'year',
  yrs: 'year',
  year: 'year',
  years: 'year'
};

export const parseRelativeTime = (relativeTime: string) => {
  // Lockup views prefix the time with the stream type, e.g. "Streamed 4d ago"
  const cleanedTime = relativeTime?.replace(/^(streamed|premiered|scheduled)\s+/i, '');
  const match = cleanedTime?.match(/(\d+)\s*([a-z]+)\s*ago/i);

  if (match) {
    const timeValue = parseInt(match[1]);
    const timeUnit = unitAliases[match[2].toLowerCase()];

    if (!isNaN(timeValue) && timeUnit) {
      let currentDate = dayjs();
      if (timeUnit.match(/day|week|month|year/i)) {
        currentDate = dayjs().startOf('day');
      }
      return currentDate.subtract(timeValue, timeUnit);
    }
  }
  return null;
};
