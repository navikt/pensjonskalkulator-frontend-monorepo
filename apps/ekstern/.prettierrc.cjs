module.exports = {
  arrowParens: 'always',
  bracketSameLine: false,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  useTabs: false,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['^@navikt', '^@/', '^[./](?!.*\\.scss$)', '.scss$'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderSideEffects: false,
}
