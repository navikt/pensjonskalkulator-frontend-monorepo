import globalClassNames from '../../style.d'
declare const classNames: typeof globalClassNames & {
  readonly wrapper: 'wrapper'
  readonly wrapperCard: 'wrapperCard'
  readonly wrapperImage: 'wrapperImage'
  readonly ingress: 'ingress'
  readonly wrapperText: 'wrapperText'
  readonly highlighted: 'highlighted'
  readonly ingress__isInline: 'ingress__isInline'
  readonly helptext: 'helptext'
  readonly alert: 'alert'
}
export = classNames
