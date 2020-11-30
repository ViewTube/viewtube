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
  }
};
