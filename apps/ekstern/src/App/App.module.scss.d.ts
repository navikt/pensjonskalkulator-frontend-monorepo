import globalClassNames from '../style.d'
declare const classNames: typeof globalClassNames & {
  readonly logo: 'logo'
  readonly logo_react: 'logo_react'
  readonly card: 'card'
  readonly button: 'button'
}
export = classNames
