import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [{
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      scrollHeight: 0
    }
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
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/Login.vue'),
    accessWithAuth: false
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('./views/Register.vue'),
    accessWithAuth: false
  },
  {
    path: '/channel/:id',
    name: 'channel',
    component: () => import('./views/Channel.vue'),
    alias: [
      '/c/:id',
      '/u/:id',
      '/user/:id'
    ]
  },
  {
    path: '/results',
    name: 'results',
    component: () => import('./views/Search.vue'),
    meta: {
      scrollHeight: 0
    }
  }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash
      }
    }
    if (savedPosition) {
      return savedPosition
    } else {
      return {
        x: 0,
        y: 0
      }
    }
  }
})
