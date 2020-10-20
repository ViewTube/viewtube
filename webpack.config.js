const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

module.exports = {
  entry: ['webpack/hot/poll?1000', './server/main.ts'],
  watch: true,
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/poll?1000']
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            getCustomTransformers: program => ({
              before: [require('@nestjs/swagger/plugin').before({}, program)]
            })
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      server: path.resolve(__dirname, 'server/')
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new WebpackShellPluginNext({
      onBuildStart: {
        scripts: ['echo Starting ViewTube in development mode'],
        blocking: false,
        parallel: true
      },
      onBuildEnd: {
        scripts: ['node dist/main.js'],
        blocking: false,
        parallel: false
      }
    })
  ],
  output: {
    path: `${__dirname}/dist`,
    publicPath: '/'
  }
};
