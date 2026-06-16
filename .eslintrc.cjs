// ESLint config for the API source and tests.
//
// A few choices to be aware of when reading this:
// - `no-explicit-any` is a warning only — some third-party types are
//   looser than we'd like, and `any` is sometimes the least-bad escape.
// - `no-unused-vars` allows a leading underscore so deliberately unused
//   params (`_req`, `_next`) don't trip the linter.
// - `prettier` extends must stay last so it can override any stylistic
//   rules that would otherwise fight Prettier.
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/', '.vercel/', '*.cjs', '*.js'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': 'warn',
    'no-console': 'off',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-var': 'error',
    'prefer-const': 'error',
  },
};
