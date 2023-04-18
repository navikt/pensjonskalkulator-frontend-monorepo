module.exports = {
  extends: 'stylelint-config-standard-scss',
  ignoreFiles: ['src/scss/designsystem.scss'],
  rules: {
    'selector-class-pattern': null,
    'scss/at-import-partial-extension': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
    // 'at-rule-no-unknown': [
    //   true,
    //   {
    //     ignoreAtRules: ['apply', 'variants', 'responsive', 'screen', 'layer'],
    //   },
    // ],
    // 'declaration-block-trailing-semicolon': null,
    // 'no-descending-specificity': null,
  },
}
