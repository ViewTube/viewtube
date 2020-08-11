export default {
  mode: 'universal',

  server: {
    port: 8066
  },

  env: {
    API_URL: process.env.VIEWTUBE_API_URL
  },

  head: {
    title: 'ViewTube',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'An alternative YouTube frontend using the invidio.us API.'
      },
      { name: 'theme-color', content: '#121212' },
      { hid: 'ogTitle', property: 'og:title', content: 'ViewTube' },
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
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  loading: {
    color: '#ff7b3b',
    height: '2px',
    throttle: 400,
    duration: 8000
  },

  css: [
    '~/assets/fonts/expletus.css',
    '~/assets/fonts/notosans.css'
  ],
  styleResources: {
    scss: ['~/assets/styles/global/*.scss']
  },

  plugins: [
    '@/plugins/directives/index',
    '@/plugins/formatting',
    { src: '@/plugins/localStorage', ssr: false }
  ],

  // pwa: {
  workbox: {
    importScripts: [
      'notifications-sw.js'
    ]
  },
  // },

  buildModules: [],

  render: {
    bundleRenderer: {
      directives: {}
    }
  },
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
    transpile: [
      'vue-material-design-icons',
      'dashjs',
      'tippy.js'
    ],
    extend(config, ctx) { }
  }
}
