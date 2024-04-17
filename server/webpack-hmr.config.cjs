const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = function (options, webpack) {
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({ modulesDir: '../node_modules', allowlist: ['webpack/hot/poll?100'] })
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
          }
        }
      ]
    },
    plugins: [
      ...options.plugins.filter(el => el.checkIgnore),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/]
      }),
      new RunScriptWebpackPlugin({ name: options.output.filename })
    ]
  };
};
