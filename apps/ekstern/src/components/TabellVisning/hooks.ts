import { SeriesColumnOptions } from 'highcharts'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { TableDataRow, formatSeriesToTableData } from './utils'

export const useTableData = (
  series: SeriesColumnOptions[],
  aarArray?: string[]
): TableDataRow[] => {
  const intl = useIntl()
  return useMemo(() => {
    return formatSeriesToTableData(intl, series, aarArray)
  }, [series])
}
