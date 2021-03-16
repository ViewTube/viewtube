import Sass from 'sass';
import { defineNuxtConfig } from '@nuxtjs/composition-api';
const dartSass = {
  implementation: Sass
};

export default defineNuxtConfig({
  srcDir: './client',

  env: {
    apiUrl: process.env.VIEWTUBE_API_URL,
    vapidKey: process.env.VIEWTUBE_PUBLIC_VAPID,
    nodeEnv: process.env.NODE_ENV,
    host: 'localhost',
    port: '3100',
    baseUrl: process.env.BASE_URL || 'http://localhost:3100'
  },

  head: {
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        hid: 'description',
        name: 'description',
        content: 'An alternative YouTube frontend using the invidio.us API.'
      },
      { name: 'theme-color', content: '#121212' },
      {
        hid: 'ogTitle',
        property: 'og:title',
        content: 'ViewTube'
      },
      { property: 'og:type', content: 'website' },
      {
        hid: 'ogImage',
        property: 'og:image',
        itemprop: 'image',
        content: 'https://viewtube.io/icon-192.png'
      },
      {
        hid: 'ogDescription',
        property: 'og:description',
        content: 'An alternative YouTube frontend using the invidio.us API.'
      },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:site_name', content: 'ViewTube' }
    ],
    htmlAttrs: {
      lang: 'en'
    },
    link: [
      {
        rel: 'search',
        type: 'application/opensearchdescription+xml',
        title: 'Search ViewTube',
        href: 'https://viewtube.io/viewtubesearch.xml'
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png'
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      }
    ]
  },

  loading: {
    color: '#ff7b3b',
    height: '2px',
    throttle: 400,
    duration: 8000
  },

  css: ['~/assets/fonts/expletus.css', '~/assets/fonts/notosans.css'],
  styleResources: {
    scss: ['~/assets/styles/global/variables.scss', '~/assets/styles/global/styles.scss']
  },

  typescript: {
    typeCheck: {
      eslint: {
        files: './**/*.{ts,js,vue}'
      }
    }
  },

  plugins: [
    '@/plugins/directives/index',
    '@/plugins/formatting',
    '@/plugins/shared',
    { src: '@/plugins/localStorage', mode: 'client' }
  ],

  pwa: {
    icon: false,
    workbox: {
      debug: true,
      importScripts: ['notifications-sw.js']
    },
    manifest: {
      name: 'ViewTube',
      short_name: 'ViewTube',
      display: 'standalone',
      background_color: '#121212',
      description: 'An alternative YouTube-frontend',
      lang: 'en',
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
  },

  buildModules: [
    '@nuxtjs/composition-api',
    '@nuxtjs/router',
    '@nuxt/typescript-build',
    'nuxt-typed-vuex'
  ],

  modules: [
    '@nuxtjs/style-resources',
    'portal-vue/nuxt',
    'cookie-universal-nuxt',
    '@nuxtjs/pwa',
    '@nuxtjs/axios',
    ['cookie-universal-nuxt', { alias: 'cookies' }]
  ],

  axios: {
    credentials: true,
    progress: false
  },

  build: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('cssnano')({
          preset: 'default'
        })
      ]
    },
    terser: {
      parallel: true,
      cache: false,
      sourceMap: false,
      extractComments: false,
      terserOptions: {
        ecma: 2020,
        mangle: true
      }
    },
    loaders: {
      scss: dartSass
    },
    indicator: true,
    transpile: ['vue-material-design-icons', 'dashjs', 'tippy.js'],
    extend(config, { isClient }) {
      if (isClient) {
        config.optimization.splitChunks.maxSize = 1000000;
      }
    }
  }
})