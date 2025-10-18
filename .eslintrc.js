module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  env: {
    node: true,
    es6: true,
  },
  // overrides: [
  //   {
  //     files: ['tests/**/*'],
  //     plugins: ['jest'],
  //     env: {
  //       'jest/globals': true,
  //     },
  //   },
  // ],
};
