export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.directive('cleanlinks', {
    created(el) {
      const html = el.innerHTML;
      const div = document.createElement('div');
      div.innerHTML = html.trim();
      Array.from(div.getElementsByTagName('a')).forEach((element, index) => {
        const hrefUrl = element.href;
        const urlParams = new URLSearchParams(hrefUrl.split('?')[1]);
        let newHrefUrl = '';
        if (urlParams.get('q') !== null) {
          const cleanUrl = urlParams.get('q');
          newHrefUrl = cleanUrl;
          div.getElementsByTagName('a')[index].text = newHrefUrl;
        } else if (urlParams.get('search_query') !== null) {
          const cleanUrl = urlParams.get('search_query').replace('#', '');
          newHrefUrl = `/results?search_query=${cleanUrl}`;
        } else {
          newHrefUrl = hrefUrl;
        }
        if (div.getElementsByTagName('a')[index] !== undefined) {
          div.getElementsByTagName('a')[index].href = newHrefUrl;
          div.getElementsByTagName('a')[index].removeAttribute('data-url');
          div.getElementsByTagName('a')[index].removeAttribute('data-target-new-window');
          div.getElementsByTagName('a')[index].removeAttribute('data-sessionlink');
          div.getElementsByTagName('a')[index].removeAttribute('rel');
        }
      });
      el.innerHTML = div.outerHTML;
    }
  });
});
