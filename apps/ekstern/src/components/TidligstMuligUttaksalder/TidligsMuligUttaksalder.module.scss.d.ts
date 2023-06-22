import globalClassNames from '../../style.d'
declare const classNames: typeof globalClassNames & {
  readonly card: 'card'
  readonly ingress: 'ingress'
  readonly highlighted: 'highlighted'
  readonly helptext: 'helptext'
}
export = classNames
