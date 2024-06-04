// @ts-check
import cypress from 'eslint-plugin-cypress';
import withNuxt from './client/.nuxt/eslint.config.mjs';

export default withNuxt([
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': 'off'
    }
  },
  {
    files: ['server/**/*'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off'
    }
  },
  {
    files: ['tests/**/*'],
    // @ts-ignore
    plugins: { cypress },
    languageOptions: {
      globals: {
        Cypress: 'readonly'
      }
    }
  }
]);
