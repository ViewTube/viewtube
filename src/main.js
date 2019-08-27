import Vue from 'vue'
import App from './App.vue'
import router from './router'
import FormattingFunctions from './formattingFunctions'
import './registerServiceWorker'
import 'vue-material-design-icons/styles.css'
import './ripple.js'
import VueClazyLoad from 'vue-clazy-load'
import VueHeadful from 'vue-headful'

Vue.use(FormattingFunctions)
Vue.use(VueClazyLoad)
Vue.component('vue-headful', VueHeadful)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
