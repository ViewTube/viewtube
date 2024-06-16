import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

export default defineNuxtPlugin(() => {
  dayjs.extend(relativeTime);
});
