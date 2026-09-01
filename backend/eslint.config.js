module.exports = [{
  files: ['src/**/*.js', 'server.js'],
  languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs' },
  rules: {
    'no-dupe-keys': 'error',
    'no-unreachable': 'error',
    'no-constant-condition': ['error', { checkLoops: false }],
  },
}];
