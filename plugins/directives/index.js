import ClickawayDirective from './clickawayDirective'
import CleanlinksDirective from './cleanlinksDirective'
import Ripple from './rippleDirective'
import VueLazyload from 'vue-lazyload'
import Vue from 'vue'

Vue.directive('clickaway', ClickawayDirective)
Vue.directive('clean-links', CleanlinksDirective)
Vue.directive('ripple', Ripple)
Vue.use(VueLazyload, {
  observer: true,
  observerOptions: {
    rootMargin: '0px',
    threshold: 0.1
  }
})