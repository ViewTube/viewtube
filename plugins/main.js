import Vue from 'vue'
import App from './App.vue'
import router from './router'
import FormattingFunctions from './formattingFunctions'
import './registerServiceWorker'
import 'vue-material-design-icons/styles.css'
import VueHeadful from 'vue-headful'
import PortalVue from 'portal-vue'
import UserStore from '../store/user'
import VueProgressBar from 'vue-progressbar'
import 'vue-cookie'
import VueLazyload from 'vue-lazyload'

import { store } from '@/store/store'
import invidious from '@/plugins/services/invidious'

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

window.invidious = invidious

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
