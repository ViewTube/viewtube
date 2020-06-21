export default (inject) => {
  const formatting = {
    getTimestampFromSeconds: seconds => {
      const ms = seconds * 1000
      const date = new Date(ms)
      const timestampHours = toDoubleDigit(date.getHours() - 1)
      const timestampMinutes = toDoubleDigit(date.getMinutes())
      const timestampSeconds = toDoubleDigit(date.getSeconds())
      if (date.getHours() >= 0) {
        return `${timestampHours}:${timestampMinutes}:${timestampSeconds}`
      } else {
        return `${timestampMinutes}:${timestampSeconds}`
      }

      function toDoubleDigit (i) {
        if (i < 10) {
          i = '0' + i
        }
        return i
      }
    }
  }

  inject('formatting', formatting)
}