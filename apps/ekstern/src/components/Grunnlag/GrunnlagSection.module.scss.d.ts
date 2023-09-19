import globalClassNames from '../../style.d'
declare const classNames: typeof globalClassNames & {
  readonly header: 'header'
  readonly content: 'content'
}
export = classNames
