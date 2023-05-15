import { useMemo } from 'react'

import { SeriesColumnOptions } from 'highcharts'

import { formatSeriesToTableData, TableDataRow } from './utils'

export const useTableData = (
  series: SeriesColumnOptions[],
  aarArray?: string[]
): TableDataRow[] =>
  useMemo(() => {
    return formatSeriesToTableData(series, aarArray)
  }, [series])
