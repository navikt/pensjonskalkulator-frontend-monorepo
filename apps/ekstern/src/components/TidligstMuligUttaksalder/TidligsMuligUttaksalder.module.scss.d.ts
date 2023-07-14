import globalClassNames from '../../style.d'
declare const classNames: typeof globalClassNames & {
  readonly wrapper: 'wrapper'
  readonly wrapperImage: 'wrapperImage'
  readonly wrapperText: 'wrapperText'
  readonly ingress: 'ingress'
  readonly highlighted: 'highlighted'
  readonly ingress__isInline: 'ingress__isInline'
  readonly helptext: 'helptext'
}
export = classNames
