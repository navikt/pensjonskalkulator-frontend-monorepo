import globalClassNames from '../../style.d'
declare const classNames: typeof globalClassNames & {
  readonly section: 'section'
  readonly heading: 'heading'
  readonly text: 'text'
}
export = classNames
