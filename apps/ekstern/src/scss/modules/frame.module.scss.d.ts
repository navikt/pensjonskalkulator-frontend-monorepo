import globalClassNames from '../../style.d'
declare const classNames: typeof globalClassNames & {
  readonly frame: 'frame'
  readonly frame__hasPadding: 'frame__hasPadding'
  readonly innerframe: 'innerframe'
  readonly innerframe__noPadding: 'innerframe__noPadding'
  readonly innerframe__largePadding: 'innerframe__largePadding'
}
export = classNames
