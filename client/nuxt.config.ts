import { devOnly } from './utils/devOnly';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';

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
    },
    plugins: [
      Components({
        resolvers: [IconsResolver()]
      }),
      Icons({})
    ]
  },

  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt-icon',
    'unplugin-icons/nuxt',
    ...devOnly(['nuxt-proxy'])
  ],

  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('i-')
    }
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
