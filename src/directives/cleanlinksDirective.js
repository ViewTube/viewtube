export default {
  inserted(el, binding) {
    let html = el.innerHTML
    let div = document.createElement('div')
    div.innerHTML = html.trim()
    Array.from(div.getElementsByTagName('a')).forEach((element, index) => {
      let hrefUrl = element.href
      let urlParams = new URLSearchParams(hrefUrl.split('?')[1])
      let newHrefUrl = ''
      if (urlParams.get('q') !== null) {
        let cleanUrl = urlParams.get('q')
        newHrefUrl = cleanUrl
        div.getElementsByTagName('a')[index].text = newHrefUrl
      } else if (urlParams.get('search_query') !== null) {
        let cleanUrl = urlParams.get('search_query').replace('#', '')
        newHrefUrl = `/results?search_query=${cleanUrl}`
      } else {
        newHrefUrl = hrefUrl
      }
      if (div.getElementsByTagName('a')[index] !== undefined) {
        div.getElementsByTagName('a')[index].href = newHrefUrl
        div.getElementsByTagName('a')[index].removeAttribute('data-url')
        div.getElementsByTagName('a')[index].removeAttribute('data-target-new-window')
        div.getElementsByTagName('a')[index].removeAttribute('data-sessionlink')
        div.getElementsByTagName('a')[index].removeAttribute('rel')
      }
    })
    el.innerHTML = div.outerHTML
  }
}
