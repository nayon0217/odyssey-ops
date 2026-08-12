// Flat ESLint config shared across the monorepo. Each package runs `eslint .`,
// which resolves this config from the repo root.
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.expo/**',
      '**/.turbo/**',
      '**/.wrangler/**',
      '**/drizzle/**',
      // Generated API client is never linted or hand-edited.
      'packages/api-client/src/generated/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/babel.config.js',
      '**/metro.config.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
    },
  },
  prettier,
);
