// @ts-check
import cypress from 'eslint-plugin-cypress';
import jest from 'eslint-plugin-jest';
import globals from 'globals';
import withNuxt from './client/.nuxt/eslint.config.mjs';

export default withNuxt([
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-extraneous-class': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': 'off'
    }
  },
  {
    files: ['tests/jest/**/*'],
    plugins: { jest },
    languageOptions: { globals: { ...globals.jest } }
  },
  {
    files: ['tests/cypress/**/*'],
    // @ts-ignore
    plugins: { cypress },
    languageOptions: {
      globals: {
        Cypress: 'readonly'
      }
    }
  }
]);
