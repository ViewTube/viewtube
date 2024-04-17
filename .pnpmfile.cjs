function readPackage(pkg) {
  if (process.env.CI === 'true') {
    delete pkg?.scripts?.prepare;
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
