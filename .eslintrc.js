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
    'valid-jsdoc': 'off',
    // typescript takes care of both of these
    'jsdoc/valid-types': 'off',
    'jsdoc/no-undefined-types': 'off'
  }
};
