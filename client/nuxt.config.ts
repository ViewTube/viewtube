const modules = ['@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'];
const devModules = ['nuxt-proxy'];

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

  modules: [...modules, ...(process.env.NUXT_BUILD === 'true' ? [] : devModules)],

  proxy: {
    options: {
      target: 'http://localhost:8067',
      changeOrigin: true,
      pathFilter: '/api'
    }
  }
});
