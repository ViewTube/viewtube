import { getSecondsFromTimestamp } from '@/plugins/shared';

const timestampRegex = /((\d{1,2}:)?\d{1,2}:\d{1,2})/gi;

export default {
  inserted(el: HTMLElement) {
    const text = el.textContent.trim();
    let htmlText = text;
    if (process.browser) {
      htmlText = text.replace(timestampRegex, match => {
        const seconds = getSecondsFromTimestamp(match);
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('t', `${seconds}s`);
        return `<a class="time-link" seconds="${seconds}" href="${location.protocol}//${
          location.host
        }${location.pathname}?${searchParams.toString()}">${match}</a>`;
      });
    }
    el.innerHTML = htmlText;
  }
};
