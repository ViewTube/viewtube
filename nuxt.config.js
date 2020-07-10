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
        content: 'https://viewtube.eu/icon-256.png'
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
        href: 'https://beta.viewtube.eu/viewtubesearch.xml'
      },
      { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' }
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
    '@/plugins/scroll',
    '@/plugins/formatting',
    { src: '@/plugins/localStorage', ssr: false }
  ],

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
    '@nuxtjs/manifest',
    ['cookie-universal-nuxt', { alias: 'cookies' }]
  ],

  pwa: {
    manifest: {
      name: 'ViewTube',
      short_name: 'ViewTube',
      description: 'An alternative YouTube-frontend',
      icons: [
        {
          src: '~/assets/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '~/assets/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      start_url: '/',
      display: 'standalone',
      background_color: '#121212',
      theme_color: '#272727',
      lang: 'en'
    }
  },

  axios: {},

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
      'tippy.js',
      'vue-scroll'
    ],
    extend(config, ctx) { }
  }
}
