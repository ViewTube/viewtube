const urlRegex = new RegExp(
  String.raw`(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])`,
  'ig'
);

export default {
  inserted(el, binding) {
    const text = el.textContent.trim();
    const htmlText = text.replace(urlRegex, match => {
      return `<a href="${match}" target="_blank" rel="noreferrer">${match}</a>`;
    });
    el.innerHTML = htmlText;
  }
};
