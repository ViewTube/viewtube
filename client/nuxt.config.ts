import { iconSafelist } from './utils/icons';
import { devOnly } from './utils/devOnly';

export default defineNuxtConfig({
  runtimeConfig: {
    rateLimitKey: '',
    public: {
      vapidKey: process.env.VIEWTUBE_PUBLIC_VAPID
    }
  },

  nitro: {
    preset: 'node',
    ...devOnly({
      devProxy: {
        '/api': { target: 'http://0.0.0.0:8067/api', changeOrigin: true }
      }
    })
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

  modules: ['@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt', '@unocss/nuxt'],

  unocss: {
    uno: false,
    icons: true,
    attributify: false,
    safelist: iconSafelist
  },

  piniaPersistedstate: {
    cookieOptions: {
      sameSite: 'strict'
    }
  }
});
