import globalClassNames from '../../style.d'
declare const classNames: typeof globalClassNames & {
  readonly section: 'section'
  readonly description: 'description'
}
export = classNames
