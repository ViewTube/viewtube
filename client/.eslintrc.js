module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    project: 'tsconfig.eslint.json',
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
    ecmaVersion: 12
  },
  extends: ['@nuxtjs/eslint-config-typescript', 'prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'space-before-function-paren': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-useless-constructor': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/require-default-prop': 'off',
    'vue/attribute-hyphenation': ['off', { ignore: ['custom-prop'] }],
    'vue/no-v-html': 'off',
    'vue/script-setup-uses-vars': 'off',
    'import/order': 'off',
    semi: 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'any'
        }
      }
    ]
  }
};
