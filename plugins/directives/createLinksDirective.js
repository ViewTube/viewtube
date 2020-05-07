
const urlRegex = new RegExp(String.raw`(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])`, 'ig')

export default {
  inserted(el, binding) {
    const text = el.innerText
    const htmlText = text.replace(urlRegex, (match) => {
      console.log(match)
      return `<a href="${match}" target="_blank">${match}</a>`
    })
    el.innerHTML = htmlText
  }
}
