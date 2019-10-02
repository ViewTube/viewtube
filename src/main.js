import Vue from 'vue'
import App from './App.vue'
import router from './router'
import FormattingFunctions from './formattingFunctions'
import './registerServiceWorker'
import 'vue-material-design-icons/styles.css'
import './ripple.js'
import VueClazyLoad from 'vue-clazy-load'
import VueHeadful from 'vue-headful'
import userStore from './store/user'
import VueProgressBar from 'vue-progressbar'

const progressOptions = {
  color: '#ff7b3b',
  failedColor: '#874b4b',
  thickness: '2px'
}

Vue.use(VueProgressBar, progressOptions)
Vue.use(FormattingFunctions)
Vue.use(VueClazyLoad)

Vue.component('vue-headful', VueHeadful)
Vue.config.productionTip = false

userStore.getCurrentUser(() => {
  console.log('starting')
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
