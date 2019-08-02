const FormattingFunctions = {
  install (Vue, options) {
    Vue.getTimestampFromSeconds = seconds => {
      let ms = seconds * 1000
      let date = new Date(ms)
      let timestampHours = toDoubleDigit(date.getHours() - 1)
      let timestampMinutes = toDoubleDigit(date.getMinutes())
      let timestampSeconds = toDoubleDigit(date.getSeconds())
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
}

export default FormattingFunctions
