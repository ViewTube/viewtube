import { useSettingsStore } from '@/store/settings';
import { getSecondsFromTimestamp } from '../../shared';

const urlRegex = /\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]/gi;
const timestampRegex = /(?:\d:)?(?:\d{1,3}:)?(?:[0-5]?\d):(?:[0-5]\d)/gi;

type TimestampFnType = (seconds: number) => void;

export const useCreateTextLinks = (timestampFn?: TimestampFnType) => {
  const settingsStore = useSettingsStore();
  const route = useRoute();

  const applyEventListeners = () => {
    if (process.client) {
      document.querySelectorAll('.time-link').forEach(element => {
        if (element.getAttribute('has-event-listener') === 'true') return;
        const secondsString = element.getAttribute('seconds');
        const seconds = secondsString ? parseInt(secondsString) : 0;
        element.addEventListener('click', (e: Event) => {
          e.preventDefault();
          if (typeof timestampFn === 'function') {
            timestampFn(seconds);
          }
        });
        element.setAttribute('has-event-listener', 'true');
      });
    }
  };

  onMounted(() => {
    applyEventListeners();
  });

  const createTextLinks = (text: string) => {
    if (!text) return '';
    let htmlText = text.replace(urlRegex, match => {
      return `<a href="${match}" target="_blank" rel="noreferrer noopener">${match}</a>`;
    });

    if (typeof timestampFn === 'function') {
      htmlText = htmlText.replace(timestampRegex, match => {
        const seconds = getSecondsFromTimestamp(match);
        const fakeDomain = 'https://example.com';
        const secondsURL = new URL(`${fakeDomain}${route.fullPath}`);
        secondsURL.searchParams.set('t', `${seconds}s`);
        const secondsPath = secondsURL.href.replace(fakeDomain, '');
        return `<a class="time-link" seconds="${seconds}" href="${secondsPath}">${match}</a>`;
      });
      applyEventListeners();
    }

    return htmlText;
  };

  return {
    createTextLinks
  };
};
