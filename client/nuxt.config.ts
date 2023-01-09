export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      vapidKey: process.env.VIEWTUBE_PUBLIC_VAPID
    }
  },

  nitro: {
    preset: 'node'
  },

  alias: {
    'viewtube/*': '../*'
  },

  typescript: {
    strict: true,
    typeCheck: 'build'
  },

  css: ['@/assets/fonts/expletus.css', '@/assets/fonts/notosans.css', 'tippy.js/dist/tippy.css'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
           @use "sass:math";
           @import "modern-js-ripple/dist/index.css";
           @import "@/assets/styles/global/variables.scss";
          `
        }
      }
    }
  },

  modules: ['@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt', '@kevinmarrec/nuxt-pwa'],

  pwa: {
    workbox: {
      enabled: true
      // ImportScripts is not yet supported by @kevinmarrec/nuxt-pwa
      // importScripts: ['notifications-sw.js']
    },
    icon: false,
    meta: false,
    manifest: false
  }
});
