/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/*spec.ts'],
  moduleNameMapper: {
    '^server/(.*)$': '<rootDir>/../../server/src/$1',
    '^test/(.*)$': '<rootDir>/$1',
    '^viewtube/(.*)$': '<rootDir>/../../$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.redis-mock.js'],
  transform: {
    '^.+\\.(t|j)s?$': ['@swc/jest']
  }
};

module.exports = config;
