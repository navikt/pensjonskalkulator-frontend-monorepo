import { AlderspensjonDetaljerListe } from '@/components/Simulering/BeregningsdetaljerForOvergangskull/hooks'

import { escapeHtml } from './utils'

export function getAlderspensjonDetaljerTable(
  alderspensjonListe: AlderspensjonDetaljerListe | undefined
): string {
  if (!alderspensjonListe) {
    return ''
  }
  const alderspensjon = alderspensjonListe.alderspensjon ?? []
  const opptjeningKap19 = alderspensjonListe.opptjeningKap19 ?? []
  const opptjeningKap20 = alderspensjonListe.opptjeningKap20 ?? []

  const getTableRows = (arr: { tekst?: string; verdi?: string | number }[]) =>
    arr
      .map((item) => {
        const label = item?.tekst ?? ''
        const value = item?.verdi != null ? String(item.verdi) : ''
        return `<tr><td style='text-align: left;'>${escapeHtml(label)}:</td><td style="text-align: right;">${escapeHtml(value)}</td></tr>`
      })
      .join('\n')

  const tableARows = getTableRows(alderspensjon)
  const tableBRows = getTableRows(opptjeningKap19)
  const tableCRows = getTableRows(opptjeningKap20)

  const tableA = tableARows
    ? `<table class="pdf-table-type2"><thead><tr><th colspan="2" style='text-align: left;'>Månedlig alderspensjon (Nav)</th></tr></thead><tbody>${tableARows}</tbody></table>`
    : null

  const tableB = tableBRows
    ? `<table><thead><tr><th colspan="2" style='text-align: left;'>Opptjening etter gamle regler</th></tr></thead><tbody>${tableBRows}</tbody></table>`
    : null

  const tableC = tableCRows
    ? `<table><thead><tr><th colspan="2" style='text-align: left;'>Opptjening etter nye regler</th></tr></thead><tbody>${tableCRows}</tbody></table>`
    : null

  // If none of the tables have rows, return an empty string
  if (!tableA && !tableB && !tableC) return ''

  // Build an array of non-empty table cells so we only render columns that exist
  const cells: string[] = []
  if (tableA) cells.push(`<td class="pdf-td-type2">${tableA}</td>`)
  if (tableB)
    cells.push(
      `<td class="pdf-td-type2" style='padding-left: 8px;'>${tableB}</td>`
    )
  if (tableC) cells.push(`<td class="pdf-td-type2">${tableC}</td>`)

  return `<table role='presentation' style='width:100%;'>
      <tr class="pdf-table-wrapper-row">
        ${cells.join('\n')}
      </tr>
    </table>`
}
