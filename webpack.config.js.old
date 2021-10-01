const path = require('path');
const nodeExternals = require('webpack-node-externals');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const PnpWebpackPlugin = require(`pnp-webpack-plugin`);

module.exports = {
  entry: ['./server/main.ts'],
  watch: true,
  target: 'node',
  externals: [{ sharp: 'commonjs sharp' }, nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: 'commonjs'
                }
              ],
              '@babel/preset-typescript'
            ],
            plugins: ['@nestjs/swagger/plugin', 'add-module-exports']
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
    },
    plugins: [PnpWebpackPlugin]
  },
  resolveLoader: { plugins: [PnpWebpackPlugin.moduleLoader(module)] },
  plugins: [
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: ['yarn node dist/main.js'],
        blocking: false,
        parallel: false
      }
    })
  ],
  output: {
    path: path.join(__dirname, '/dist'),
    publicPath: '/'
  }
};
