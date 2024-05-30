const { defineConfig } = require('cypress');

module.exports = defineConfig({
  retries: {
    runMode: 3,
    openMode: 0
  },
  e2e: {
    defaultCommandTimeout: 10000,
    
  }
});
