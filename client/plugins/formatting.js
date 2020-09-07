export default (context, inject) => {
  const formatting = {
    getTimestampFromSeconds: seconds => {
      const hours = Math.floor(seconds / 3600);
      seconds -= hours * 3600;
      const minutes = Math.floor(seconds / 60);
      const timestampMinutes = toDoubleDigit(minutes);
      seconds -= minutes * 60;
      const timestampSeconds = toDoubleDigit(
        Math.floor(seconds)
      );
      if (hours >= 1) {
        const timestampHours = toDoubleDigit(
          Math.floor(hours)
        );
        return `${timestampHours}:${timestampMinutes}:${timestampSeconds}`;
      } else {
        return `${timestampMinutes}:${timestampSeconds}`;
      }

      function toDoubleDigit(i) {
        if (i >= 0 && i < 10) {
          i = '0' + i;
        }
        return i;
      }
    }
  };

  inject('formatting', formatting);
};
