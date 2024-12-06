module.exports = {
  extends: 'stylelint-config-standard-scss',
  ignoreFiles: ['src/scss/designsystem.scss', 'src/scss/variables.scss'],
  rules: {
    'selector-class-pattern': null,
    'scss/at-import-partial-extension': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['composes', 'compose-with'],
      },
    ],
    'value-keyword-case': [
      'lower',
      {
        ignoreProperties: ['composes', 'font-family'],
      },
    ],
  },
}
