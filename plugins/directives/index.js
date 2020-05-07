import ClickawayDirective from './clickawayDirective'
import CreatelinksDirective from './createLinksDirective'
import Ripple from './rippleDirective'
import VueLazyload from 'vue-lazyload'
import Vue from 'vue'

Vue.directive('clickaway', ClickawayDirective)
Vue.directive('create-links', CreatelinksDirective)
Vue.directive('ripple', Ripple)
Vue.use(VueLazyload, {
  observer: true,
  observerOptions: {
    rootMargin: '0px',
    threshold: 0.1
  }
})
