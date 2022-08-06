module.exports = function (options) {
  return {
    ...options,
    entry: [options.entry],
    output: { filename: 'main.cjs' }
  };
};
