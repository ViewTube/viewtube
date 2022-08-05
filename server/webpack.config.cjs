/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

module.exports = function (options) {
  const config = {
    ...options,
    entry: [options.entry],
    output: { filename: 'main.cjs' }
  };

  fs.writeFileSync('./webpackconfig.json', JSON.stringify(config, null, 2));

  return config;
};
