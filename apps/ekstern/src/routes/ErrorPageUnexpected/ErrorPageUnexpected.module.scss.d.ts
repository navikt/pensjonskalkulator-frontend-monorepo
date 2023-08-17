import globalClassNames from '../../style.d'
declare const classNames: typeof globalClassNames & {
  readonly button: 'button'
  readonly buttonFirst: 'buttonFirst'
  readonly buttonSecond: 'buttonSecond'
}
export = classNames
