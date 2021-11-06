/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/test/**/*spec.ts'],
  moduleNameMapper: {
    '^server/(.*)$': '<rootDir>/$1',
    '^test/(.*)$': '<rootDir>/test/$1',
    '^viewtube/(.*)$': '<rootDir>/../$1'
  },
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.redis-mock.js'],
  testPathIgnorePatterns: ['<rootDir>/dist/*']
};

module.exports = config;
