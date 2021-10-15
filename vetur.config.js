const path = require('path');

/** @type {import('vls').VeturConfig} */
module.exports = {
  settings: {
    "vetur.useWorkspaceDependencies": true,
    "typescript.tsdk": path.resolve(__dirname, '.yarn/sdks/typescript/bin'),
  },
  projects: [
    {
      root: './client',
      package: './package.json',
      tsconfig: './tsconfig.json'
    }
  ]
}
