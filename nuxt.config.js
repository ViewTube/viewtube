export default {
  mode: 'universal',

  server: {
    port: 8066
  },

  env: {
    API_URL: process.env.API_URL || 'http://localhost:3030'
  },

  head: {
    title: 'ViewTube',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'An alternative YouTube frontend using the invidio.us API.' },
      { name: 'theme-color', content: '#121212' },
      { hid: 'ogTitle', property: 'og:title', content: 'ViewTube' },
      { property: 'og:type', content: 'website' },
      { hid: 'ogImage', property: 'og:image', itemprop: 'image', content: 'https://viewtube.eu/icon-256.png' },
      { hid: 'ogDescription', property: 'og:description', content: 'An alternative YouTube frontend using the invidio.us API.' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:site_name', content: 'ViewTube' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' }
    ]
  },

  loading: { color: '#ff7b3b' },

  css: [
  ],

  styleResources: {
    scss: [
      '~/assets/styles/global/*.scss'
    ]
  },

  plugins: [
    '@/plugins/directives/index',
    '@plugins/feathers-vuex.js',
    '@/plugins/scroll'
  ],

  buildModules: [
  ],

  render: {
    bundleRenderer: {
      directives: {
      }
    }
  },
  modules: [
    '@nuxtjs/style-resources',
    'portal-vue/nuxt',
    'cookie-universal-nuxt'
  ],

  axios: {
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
      '/plugins',
      'dashjs',
      'raw-loader',
      'register-service-worker',
      'tippy.js',
      'vue-global-var',
      'vue-lazyload',
      'vuex-persist',
      'feathers-vuex',
      'interactjs',
      'vue-scroll'
    ],
    extend(config, ctx) {
    }
  }
}
