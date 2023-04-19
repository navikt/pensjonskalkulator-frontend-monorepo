import globalClassNames from '../../style.d'
declare const classNames: typeof globalClassNames & {
  readonly loader: 'loader'
  readonly paragraph: 'paragraph'
}
export = classNames
