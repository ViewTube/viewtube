const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

module.exports = {
  entry: ['webpack/hot/poll?1000', './server/main.ts'],
  watch: true,
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/poll?1000'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@server': path.resolve(__dirname, 'server/')
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin(),
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: ['node dist/main.js'],
        blocking: false,
        parallel: false
      }
    }),
  ],
  output: {
    path: `${__dirname}/dist`,
    publicPath: '/',
  },
};