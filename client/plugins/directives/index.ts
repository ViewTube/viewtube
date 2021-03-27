import Vue from 'vue';
import CreatelinksDirective from './createLinksDirective';
import CreateTimestamplinksDirective from './createTimestampLinksDirective';
import Ripple from './rippleDirective';
import Tippy from './tippyDirective';

Vue.directive('create-links', CreatelinksDirective);
Vue.directive('create-timestamp-links', CreateTimestamplinksDirective);
Vue.directive('ripple', Ripple);
Vue.directive('tippy', Tippy);
