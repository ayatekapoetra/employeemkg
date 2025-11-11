const { config } = require('eslint-config-expo');

module.exports = [
  ...config,
  {
    ignores: ['node_modules', '.expo', 'dist', 'build'],
  },
  {
    rules: {
      'react/prop-types': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
