import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import NProgress from 'nprogress/nprogress.js'
import 'nprogress/nprogress.css'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('./views/Settings.vue')
    },
    {
      path: '/watch',
      name: 'watch',
      component: () => import('./views/Watch.vue')
    }
  ],
  beforeResolve: (to, from, next) => {
    console.log('test')
    if (to.name) {
      NProgress.start()
    }
  }
})
