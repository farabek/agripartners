export default [{
  files: ['*.js', 'src/**/*.js'],
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: {
    'no-dupe-keys': 'error',
    'no-unreachable': 'error',
    'no-constant-condition': ['error', { checkLoops: false }],
  },
}];
