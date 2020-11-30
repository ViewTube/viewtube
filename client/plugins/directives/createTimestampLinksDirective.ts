import { getSecondsFromTimestamp } from '@/plugins/shared';
import { DirectiveBinding } from 'vue/types/options';

const urlRegex = new RegExp(
  String.raw`(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])`,
  'ig'
);

const timestampRegex = /((\d{1,2}:)?\d{1,2}:\d{1,2})/gi;

export default {
  inserted(el: HTMLElement, binding: DirectiveBinding) {
    const text = el.textContent.trim();
    let htmlText = text.replace(urlRegex, match => {
      return `<a href="${match}" target="_blank" rel="noreferrer noopener">${match}</a>`;
    });
    if (process.browser) {
      htmlText = htmlText.replace(timestampRegex, match => {
        const seconds = getSecondsFromTimestamp(match);
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('t', `${seconds}s`);
        return `<a class="time-link" seconds="${seconds}" href="${location.protocol}//${
          location.host
        }${location.pathname}?${searchParams.toString()}">${match}</a>`;
      });
    }
    el.innerHTML = htmlText;

    const links = document.getElementsByClassName('time-link');

    for (let i = 0; i < links.length; i++) {
      const element = links[i];
      const secondsString = element.getAttribute('seconds');
      const seconds = secondsString ? parseInt(secondsString) : 0;
      (element as any).addEventListener('click', (e: Event) => binding.value(e, seconds));
    }
  }
};
