const path = require('path')
module.exports = {
  pluginOptions: {
    'style-resources-loader': {
      'patterns': [
        path.resolve(__dirname, 'src/styles/global/*.scss'),
      ],
      'preProcessor': 'scss'
    }
  }
}