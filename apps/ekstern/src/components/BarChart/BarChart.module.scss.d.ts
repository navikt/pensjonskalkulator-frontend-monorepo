import globalClassNames from '../../style'
declare const classNames: typeof globalClassNames & {
  readonly chart: 'chart'
  readonly header: 'header'
  readonly cell: 'cell'
  readonly bar: 'bar'
}
export = classNames
