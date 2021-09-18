import { wrapProperty } from '@nuxtjs/composition-api';
import Vue from 'vue';

interface FormattingFunction {
  (seconds: number): string;
}

declare module 'vue/types/vue' {
  interface Vue {
    $formatting: { getTimestampFromSeconds: FormattingFunction };
  }
}

Vue.prototype.$formatting = {
  getTimestampFromSeconds: (seconds: number): string => {
    const toDoubleDigit = (i: number) => {
      let str = i.toString();
      if (i >= 0 && i < 10) {
        str = '0' + i;
      }
      return str;
    };

    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    const timestampMinutes = toDoubleDigit(minutes);
    seconds -= minutes * 60;
    const timestampSeconds = toDoubleDigit(Math.floor(seconds));
    if (hours >= 1) {
      const timestampHours = toDoubleDigit(Math.floor(hours));
      return `${timestampHours}:${timestampMinutes}:${timestampSeconds}`;
    } else {
      return `${timestampMinutes}:${timestampSeconds}`;
    }
  },
  /**
   * Format bytes as human-readable text.
   *
   * @param bytes Number of bytes.
   * @param si True to use metric (SI) units, aka powers of 1000. False to use
   *           binary (IEC), aka powers of 1024.
   * @param dp Number of decimal places to display.
   *
   * @return Formatted string.
   */
  humanizeFileSize: (bytes: number, si = false, dp = 1): string => {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return bytes.toFixed(dp) + ' ' + units[u];
  }
};

export const useFormatting = wrapProperty('$formatting', false);
