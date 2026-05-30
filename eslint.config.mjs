import baseConfig from './packages/config/eslint/base.js';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.next/**',
      '*.min.js',
    ],
  },
  ...baseConfig,
];
