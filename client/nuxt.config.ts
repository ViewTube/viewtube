import { devOnly } from './utils/devOnly';

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
    shim: false,
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

  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@unocss/nuxt',
    ...devOnly(['nuxt-proxy'])
  ],

  unocss: {
    uno: false,
    icons: true,
    attributify: false,
    safelist: [
      'i-mdi-account-child-outline',
      'i-mdi-account-circle',
      'i-mdi-account-music-outline',
      'i-mdi-account-outline',
      'i-mdi-account-plus',
      'i-mdi-alert-circle-outline',
      'i-mdi-arrow-collapse',
      'i-mdi-arrow-expand',
      'i-mdi-arrow-left',
      'i-mdi-arrow-right',
      'i-mdi-at',
      'i-mdi-book-open-variant',
      'i-mdi-brightness-4',
      'i-mdi-calendar-clock',
      'i-mdi-check-decagram',
      'i-mdi-chevron-left',
      'i-mdi-chevron-right',
      'i-mdi-chevron-up',
      'i-mdi-close',
      'i-mdi-cloud-check-outline',
      'i-mdi-cog',
      'i-mdi-comment-outline',
      'i-mdi-comment-remove-outline',
      'i-mdi-content-copy',
      'i-mdi-counter',
      'i-mdi-database-export-outline',
      'i-mdi-delete',
      'i-mdi-delete-alert',
      'i-mdi-eye',
      'i-mdi-eye-off',
      'i-mdi-form-textbox-password',
      'i-mdi-fullscreen',
      'i-mdi-fullscreen-exit',
      'i-mdi-github',
      'i-mdi-heart',
      'i-mdi-high-definition',
      'i-mdi-history',
      'i-mdi-home',
      'i-mdi-import',
      'i-mdi-information',
      'i-mdi-information-outline',
      'i-mdi-key-outline',
      'i-mdi-lightbulb',
      'i-mdi-logout-variant',
      'i-mdi-magnify',
      'i-mdi-open-in-new',
      'i-mdi-pause',
      'i-mdi-pencil',
      'i-mdi-pencil-box-multiple-outline',
      'i-mdi-play',
      'i-mdi-playlist-play',
      'i-mdi-plus',
      'i-mdi-qrcode',
      'i-mdi-quality-high',
      'i-mdi-reload',
      'i-mdi-repeat',
      'i-mdi-restart-off',
      'i-mdi-rotate-left',
      'i-mdi-select',
      'i-mdi-select-all',
      'i-mdi-share',
      'i-mdi-shuffle',
      'i-mdi-skip-next',
      'i-mdi-skip-previous',
      'i-mdi-television',
      'i-mdi-thumb-down',
      'i-mdi-thumb-up',
      'i-mdi-undo',
      'i-mdi-volume-high',
      'i-mdi-volume-low',
      'i-mdi-volume-medium',
      'i-mdi-volume-off',
      'i-mdi-window-restore',
      'i-mdi-xml',
      'i-mdi-youtube',
      'i-mdi-youtube-subscription'
    ]
  },

  piniaPersistedstate: {
    cookieOptions: {
      sameSite: 'strict'
    }
  },

  proxy: {
    options: {
      target: 'http://localhost:8067',
      changeOrigin: true,
      pathFilter: '/api'
    }
  }
});
