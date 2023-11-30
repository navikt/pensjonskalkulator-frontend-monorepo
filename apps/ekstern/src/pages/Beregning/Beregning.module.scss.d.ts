import globalClassNames from '../../style.d'
declare const classNames: typeof globalClassNames & {
  readonly container: 'container'
  readonly container__hasPadding: 'container__hasPadding'
  readonly background: 'background'
  readonly background__hasMargin: 'background__hasMargin'
  readonly background__white: 'background__white'
  readonly background__lightblue: 'background__lightblue'
}
export = classNames
