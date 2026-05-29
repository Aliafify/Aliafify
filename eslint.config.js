import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'backend/**',
      'vite.config.js',
      'vite.config.d.ts',
      'tailwind.config.js',
      'postcss.config.js',
    ],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'vite.config.ts', 'tailwind.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        Blob: 'readonly',
        console: 'readonly',
        crypto: 'readonly',
        document: 'readonly',
        File: 'readonly',
        navigator: 'readonly',
        URL: 'readonly',
        window: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
