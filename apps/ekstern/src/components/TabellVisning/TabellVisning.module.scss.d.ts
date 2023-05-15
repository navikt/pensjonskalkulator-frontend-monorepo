import globalClassNames from '../../style.d'
declare const classNames: typeof globalClassNames & {
  readonly table: 'table'
  readonly 'navds-table__expanded-row-content': 'navds-table__expanded-row-content'
  readonly 'navds-table__expandable-row--open': 'navds-table__expandable-row--open'
  readonly details: 'details'
  readonly detailsItemRight: 'detailsItemRight'
}
export = classNames
