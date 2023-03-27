module.exports = {
  extends: 'stylelint-config-standard-scss',
  rules: {
    'selector-class-pattern': null,
    'scss/at-import-partial-extension': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
  },
}
