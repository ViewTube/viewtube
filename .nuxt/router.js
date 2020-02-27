import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _1b8b7fcc = () => interopDefault(import('../pages/Channel.vue' /* webpackChunkName: "pages/Channel" */))
const _1c7ba23c = () => interopDefault(import('../pages/Embed.vue' /* webpackChunkName: "pages/Embed" */))
const _4e03c540 = () => interopDefault(import('../pages/ErrorPage.vue' /* webpackChunkName: "pages/ErrorPage" */))
const _4990006f = () => interopDefault(import('../pages/Search.vue' /* webpackChunkName: "pages/Search" */))
const _55ea5902 = () => interopDefault(import('../pages/Subscriptions.vue' /* webpackChunkName: "pages/Subscriptions" */))
const _3502b9d8 = () => interopDefault(import('../pages/Watch.vue' /* webpackChunkName: "pages/Watch" */))
const _ced19f4e = () => interopDefault(import('../pages/authentication/Login.vue' /* webpackChunkName: "pages/authentication/Login" */))
const _3f57443a = () => interopDefault(import('../pages/authentication/Register.vue' /* webpackChunkName: "pages/authentication/Register" */))
const _c3ad770a = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

// TODO: remove in Nuxt 3
const emptyFn = () => {}
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onComplete = emptyFn, onAbort) {
  return originalPush.call(this, location, onComplete, onAbort)
}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: decodeURI('/'),
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/Channel",
    component: _1b8b7fcc,
    name: "Channel"
  }, {
    path: "/Embed",
    component: _1c7ba23c,
    name: "Embed"
  }, {
    path: "/ErrorPage",
    component: _4e03c540,
    name: "ErrorPage"
  }, {
    path: "/Search",
    component: _4990006f,
    name: "Search"
  }, {
    path: "/Subscriptions",
    component: _55ea5902,
    name: "Subscriptions"
  }, {
    path: "/Watch",
    component: _3502b9d8,
    name: "Watch"
  }, {
    path: "/authentication/Login",
    component: _ced19f4e,
    name: "authentication-Login"
  }, {
    path: "/authentication/Register",
    component: _3f57443a,
    name: "authentication-Register"
  }, {
    path: "/",
    component: _c3ad770a,
    name: "index"
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
