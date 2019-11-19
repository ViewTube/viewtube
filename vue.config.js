const path = require('path')
module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    resolve: {
      alias: {
        'icons': path.resolve(__dirname, 'node_modules/vue-material-design-icons')
      },
      extensions: [
        '.vue'
      ]
    }
  },
  pluginOptions: {
    'style-resources-loader': {
      'patterns': [
        path.resolve(__dirname, 'src/styles/global/*.scss')
      ],
      'preProcessor': 'scss'
    }
  }
}
