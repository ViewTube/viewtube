import Vue from 'vue'
import App from './App.vue'
import router from './router'
import FormattingFunctions from './formattingFunctions'
import './registerServiceWorker'
import 'vue-material-design-icons/styles.css'
import './ripple.js'
import Tooltip from 'v-tooltip'
import VueClazyLoad from 'vue-clazy-load'
import vueHeadful from 'vue-headful'

Vue.use(FormattingFunctions)
Vue.use(Tooltip)
Vue.use(VueClazyLoad)
Vue.component('vue-headful', vueHeadful)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
