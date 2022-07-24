function readPackage(pkg, context) {
  if (process.env.CI === "true") {
    delete pkg?.scripts?.prepare;
  }

  return pkg;
}

function afterAllResolved(lockfile, context) {
  context.log("ay");

  return lockfile;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
