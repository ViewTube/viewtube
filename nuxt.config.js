module.exports = {
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
      { rel: 'manifest', href: '/manifest.json' },
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
    scss: ['~/assets/styles/global/*.scss']
  },

  plugins: [
    '@/plugins/directives/index',
    '@/plugins/formatting',
    { src: '@/plugins/localStorage', mode: 'client' }
  ],

  // pwa: {
  workbox: {
    importScripts: ['notifications-sw.js']
  },
  // },

  buildModules: ['@nuxtjs/router'],

  modules: [
    '@nuxtjs/style-resources',
    'portal-vue/nuxt',
    'cookie-universal-nuxt',
    '@nuxtjs/workbox',
    '@nuxtjs/axios',
    ['cookie-universal-nuxt', { alias: 'cookies' }]
  ],

  axios: {
    credentials: true
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
    indicator: true,
    transpile: ['vue-material-design-icons', 'dashjs', 'tippy.js'],
    extend(config, { isClient }) {
      if (isClient) {
        config.optimization.splitChunks.maxSize = 1000000;
      }
    }
  }
};
