/* eslint-disable @typescript-eslint/no-var-requires */
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = function (options) {
  const config = {
    ...options,
    entry: [options.entry],
    output: { filename: 'main.cjs' },
    plugins: [...options.plugins, new ForkTsCheckerWebpackPlugin()]
  };

  config.module.rules[0].use.find(use => use.loader === 'ts-loader').options.transpileOnly = true;

  return config;
};
