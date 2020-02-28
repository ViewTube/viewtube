export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: 'ViewTube',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'An alternative YouTube frontend using the invidio.us API.' },
      { name: "theme-color", content: "#121212" }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#ff7b3b' },
  /*
  ** Global CSS
  */
  css: [
  ],

  styleResources: {
    scss: [
      '~/assets/styles/global/*.scss'
    ]
  },
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/directives/index'
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
  ],

  render: {
    bundleRenderer: {
      directives: {
      }
    }
  },
  modules: [
    '@nuxtjs/style-resources',
    '@nuxtjs/pwa',
    'portal-vue/nuxt',
    // Doc: https://axios.nuxtjs.org/usage'
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
  },
  /*
  ** Build configuration
  */
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
      // 'interactjs',
      'raw-loader',
      'register-service-worker',
      'tippy.js',
      'vue-cookie',
      'vue-global-var',
      'vue-lazyload',
      'vuex-persist'
    ],
    extend(config, ctx) {
    }
  }
}
