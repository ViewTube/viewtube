export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#1e1e1e' },
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
    '@nuxtjs/style-resources'
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
    /*
    ** You can extend webpack config here
    */
    transpile: [
      'vue-material-design-icons',
      '/plugins',
      'dashjs',
      // 'interactjs',
      'portal-vue',
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
