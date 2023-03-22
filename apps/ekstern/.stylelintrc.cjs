module.exports = {
  extends: 'stylelint-config-standard-scss',
  rules: {
    'selector-class-pattern': false,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
  },
}
