import Vue from 'vue'
import ClickawayDirective from './clickawayDirective'
import CreatelinksDirective from './createLinksDirective'
import Ripple from './rippleDirective'
import Tippy from './tippyDirective'

Vue.directive('clickaway', ClickawayDirective)
Vue.directive('create-links', CreatelinksDirective)
Vue.directive('ripple', Ripple)
Vue.directive('tippy', Tippy)
