import Vue from 'vue'
import App from './App.vue'
import router from './router'
import FormattingFunctions from './formattingFunctions'
import './registerServiceWorker'
import 'vue-material-design-icons/styles.css'
import './ripple.js'
import VueHeadful from 'vue-headful'
import PortalVue from 'portal-vue'
import UserStore from './store/user'
import VueProgressBar from 'vue-progressbar'
import VueCookie from 'vue-cookie'
import VueLazyload from 'vue-lazyload'
import ClickawayDirective from './directives/clickawayDirective'
import CleanlinksDirective from './directives/cleanlinksDirective'
import { store } from '@/store/store'

const progressOptions = {
  color: '#ff7b3b',
  failedColor: '#874b4b',
  thickness: '3px',
  transition: {
    speed: '0.2s',
    opacity: '0.6s',
    termination: 300
  }
}

Vue.directive('clickaway', ClickawayDirective)
Vue.directive('clean-links', CleanlinksDirective)

Vue.use(VueProgressBar, progressOptions)
Vue.use(FormattingFunctions)
Vue.use(VueCookie)
Vue.use(PortalVue)
Vue.use(VueLazyload, {
  observer: true,

  observerOptions: {
    rootMargin: '0px',
    threshold: 0.1
  }
})

Vue.component('vue-headful', VueHeadful)
Vue.config.productionTip = false

UserStore.getCurrentUser({
  callback: () => {
    console.log('User logged in')
  },
  failure: (errorMsg) => {
    console.log('Not logged in: ' + errorMsg)
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
