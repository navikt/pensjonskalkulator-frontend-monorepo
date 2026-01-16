import { IntlShape } from 'react-intl'

import { TableDataRow } from '@/components/TabellVisning/utils'
import { formatInntekt } from '@/utils/inntekt'

export function getChartTable({
  tableData,
  intl,
}: {
  tableData: TableDataRow[]
  intl: IntlShape
}): string {
  const tableHeading = `<h3>Årlig inntekt og pensjon</h3><div class="pdf-metadata">${intl.formatMessage({ id: 'beregning.intro.description_1.endring' })}</div>`

  let tableHtml = `<table><thead><tr><th style="text-align: left;">Alder</th><th>Sum (kr)</th>`

  const detailNames = Array.from(
    new Set(tableData.flatMap((row) => row.detaljer.map((d) => d.name)))
  )
  detailNames.forEach((name) => {
    tableHtml += `<th style="text-align: right;">${name}</th>`
  })

  tableHtml += '</tr></thead><tbody>'

  tableData.forEach((row) => {
    tableHtml += `<tr><th style="text-align: left;">${row.alder}</th><td style="text-align: right;">${formatInntekt(row.sum).replace(/\u00A0/g, ' ')}</td>`
    detailNames.forEach((name) => {
      const detail = row.detaljer.find((d) => d.name === name)
      const amount =
        detail && detail.subSum
          ? `${formatInntekt(detail.subSum).replace(/\u00A0/g, ' ')} kr`
          : ''

      tableHtml += `<td style="text-align: right;">${amount.replace(/\u00A0/g, ' ')}</td>`
    })
    tableHtml += '</tr>'
  })

  tableHtml += '</tbody></table>'
  return tableHeading + tableHtml
}
