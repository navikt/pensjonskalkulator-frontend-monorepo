import globalClassNames from '../style.d'
declare const classNames: typeof globalClassNames & {
  readonly ingress: 'ingress'
}
export = classNames
