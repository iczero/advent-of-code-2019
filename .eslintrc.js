module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  env: {
    node: true,
    es6: true
  },
  extends: ['@hellomouse/eslint-config'],
  rules: {
    // doesn't work sometimes
    'valid-jsdoc': 'off'
  }
};
