import globalClassNames from '../../style.d'
declare const classNames: typeof globalClassNames & {
  readonly container: 'container'
  readonly container__hasPadding: 'container__hasPadding'
  readonly background: 'background'
  readonly background__hasMargin: 'background__hasMargin'
  readonly background__hasMinheight: 'background__hasMinheight'
  readonly background__white: 'background__white'
}
export = classNames
