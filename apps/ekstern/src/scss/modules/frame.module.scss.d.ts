import globalClassNames from '../../style.d'
declare const classNames: typeof globalClassNames & {
  readonly frame: 'frame'
  readonly frame_haspadding: 'frame_haspadding'
}
export = classNames
