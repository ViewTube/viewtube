import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _7749ed1e = () => interopDefault(import('..\\pages\\App.vue' /* webpackChunkName: "pages_App" */))
const _741a9700 = () => interopDefault(import('..\\pages\\Channel.vue' /* webpackChunkName: "pages_Channel" */))
const _5e170096 = () => interopDefault(import('..\\pages\\Embed.vue' /* webpackChunkName: "pages_Embed" */))
const _091ec618 = () => interopDefault(import('..\\pages\\ErrorPage.vue' /* webpackChunkName: "pages_ErrorPage" */))
const _11fd83b2 = () => interopDefault(import('..\\pages\\Home.vue' /* webpackChunkName: "pages_Home" */))
const _67d5653b = () => interopDefault(import('..\\pages\\Search.vue' /* webpackChunkName: "pages_Search" */))
const _67c69d9a = () => interopDefault(import('..\\pages\\Subscriptions.vue' /* webpackChunkName: "pages_Subscriptions" */))
const _bd50e8e8 = () => interopDefault(import('..\\pages\\Watch.vue' /* webpackChunkName: "pages_Watch" */))
const _1fdaf62e = () => interopDefault(import('..\\pages\\authentication\\Login.vue' /* webpackChunkName: "pages_authentication_Login" */))
const _6fc16824 = () => interopDefault(import('..\\pages\\authentication\\Register.vue' /* webpackChunkName: "pages_authentication_Register" */))

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
    path: "/App",
    component: _7749ed1e,
    name: "App"
  }, {
    path: "/Channel",
    component: _741a9700,
    name: "Channel"
  }, {
    path: "/Embed",
    component: _5e170096,
    name: "Embed"
  }, {
    path: "/ErrorPage",
    component: _091ec618,
    name: "ErrorPage"
  }, {
    path: "/Home",
    component: _11fd83b2,
    name: "Home"
  }, {
    path: "/Search",
    component: _67d5653b,
    name: "Search"
  }, {
    path: "/Subscriptions",
    component: _67c69d9a,
    name: "Subscriptions"
  }, {
    path: "/Watch",
    component: _bd50e8e8,
    name: "Watch"
  }, {
    path: "/authentication/Login",
    component: _1fdaf62e,
    name: "authentication-Login"
  }, {
    path: "/authentication/Register",
    component: _6fc16824,
    name: "authentication-Register"
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
