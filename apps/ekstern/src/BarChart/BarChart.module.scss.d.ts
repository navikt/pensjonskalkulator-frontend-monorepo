import globalClassNames from '../style.d'
declare const classNames: typeof globalClassNames & {
  readonly chart: 'chart'
  readonly header: 'header'
  readonly cell: 'cell'
  readonly bar: 'bar'
  readonly table: 'table'
}
export = classNames
