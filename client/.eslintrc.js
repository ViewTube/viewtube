module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true
  },

  extends: ['@nuxt/eslint-config', 'prettier'],

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'space-before-function-paren': 'off',
    'no-unused-vars': 'off',
    'vue/multi-word-component-names': 'warn',
    'vue/no-v-html': 'off',
    'vue/script-setup-uses-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ]
  }
};
