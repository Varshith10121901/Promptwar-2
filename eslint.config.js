import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        firebase: 'readonly',
        gtag: 'readonly',
        lucide: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'eqeqeq': 'error',
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-undef': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'curly': 'error',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'functions/', 'tests/', 'public/'],
  },
];
