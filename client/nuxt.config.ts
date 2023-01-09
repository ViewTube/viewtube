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
      enabled: true,
      workboxUrl: '/workbox/workbox-sw.js',
      importScripts: ['notifications-sw.js']
    },
    icon: false,
    meta: false,
    manifest: {
      name: 'ViewTube',
      short_name: 'ViewTube',
      description: 'An alternative YouTube frontend',
      lang: 'en',
      display: 'standalone',
      background_color: '#121212',
      theme_color: '#272727',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-256.png',
          sizes: '256x256',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-192-maskable.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/icon-256-maskable.png',
          sizes: '256x256',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/icon-512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    }
  }
});
