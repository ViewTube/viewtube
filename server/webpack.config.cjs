module.exports = function (options) {
  const config = {
    ...options,
    output: { filename: 'main.cjs' }
  };

  return config;
};
