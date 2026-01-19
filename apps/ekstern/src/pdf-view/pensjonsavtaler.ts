import { IntlShape } from 'react-intl'

import {
  formaterLivsvarigString,
  formaterSluttAlderString,
} from '@/utils/alder'
import { formatInntekt } from '@/utils/inntekt'
import { capitalize } from '@/utils/string'

import { escapeHtml, getPdfLink, pdfFormatMessageValues } from './utils'

export function getPensjonsavtaler({
  intl,
  privatePensjonsAvtaler,
  offentligTp,
}: {
  intl: IntlShape
  privatePensjonsAvtaler:
    | Record<
        'andre avtaler' | 'privat tjenestepensjon' | 'individuelle ordninger',
        Pensjonsavtale[]
      >
    | undefined
  offentligTp?: OffentligTpResponse
}): string {
  const privatePensjonsAvtalerTable = getPrivatePensjonsAvtaler(
    privatePensjonsAvtaler,
    intl
  )
  const offentligTpTable = getOffentligTpTable({
    offentligTp,
    intl,
  })
  return `<h3>Pensjonsavtaler (arbeidsgivere m.m.)</h3>
        ${privatePensjonsAvtalerTable ?? ''}
        ${offentligTpTable ?? ''}
        
  ${privatePensjonsAvtalerTable || offentligTpTable ? `<p>${intl.formatMessage({ id: 'pensjonsavtaler.fra_og_med_forklaring' })}</p>` : ''}`
}

function getPrivatePensjonsAvtaler(
  privatePensjonsAvtaler:
    | Record<
        'andre avtaler' | 'privat tjenestepensjon' | 'individuelle ordninger',
        Pensjonsavtale[]
      >
    | undefined,
  intl: IntlShape
): string | undefined {
  if (!privatePensjonsAvtaler) return

  const NORSK_PENSJON_URL = 'https://norskpensjon.no'

  const groupOrder = [
    'individuelle ordninger',
    'privat tjenestepensjon',
    'andre avtaler',
  ] as const

  let html = ''

  groupOrder.forEach((groupKey) => {
    const pensjonsAvtalerGruppe = privatePensjonsAvtaler[groupKey]
    if (
      !Array.isArray(pensjonsAvtalerGruppe) ||
      pensjonsAvtalerGruppe.length === 0
    ) {
      html += ''
    } else {
      html += `<h3>${escapeHtml(capitalize(groupKey))}</h3>`

      let rows = ''
      pensjonsAvtalerGruppe.forEach((pensjonsavtale: Pensjonsavtale) => {
        rows += getPensjonsAvtalerTableRows({
          utbetalingsperioder: pensjonsavtale.utbetalingsperioder ?? [],
          pensjonsleverandor: pensjonsavtale.produktbetegnelse,
          intl,
        })
      })

      html += `<table class="pdf-table-type2" style="width: 60%"><thead><tr><th style='text-align:left;'>Avtale</th><th style='text-align:left;'>Perioder</th><th style='text-align:right;'>Årlig Beløp</th></tr></thead><tbody>${rows}</tbody></table>`
      if (groupKey === 'privat tjenestepensjon') {
        html += `<p>${intl.formatMessage(
          { id: 'pensjonsavtaler.private.ingress.norsk_pensjon' },
          {
            ...pdfFormatMessageValues,
            norskPensjonLink: (chunks: string[]) =>
              getPdfLink({
                url: NORSK_PENSJON_URL,
                displayText: chunks.join('') || 'Norsk Pensjon',
              }),
          }
        )}</p>`
      }
    }
  })

  return html
}

function getPensjonsAvtalerTableRows({
  utbetalingsperioder,
  pensjonsleverandor,
  intl,
}: {
  utbetalingsperioder: Utbetalingsperiode[]
  pensjonsleverandor: string
  intl: IntlShape
}): string {
  let rows = ''
  utbetalingsperioder.forEach((periode: Utbetalingsperiode, index: number) => {
    const isFirst = index === 0
    const isLast = index === utbetalingsperioder.length - 1
    const lastRowStyle =
      isLast || utbetalingsperioder.length > 1
        ? 'border-bottom: none; font-weight: normal'
        : ''

    const produktCell = isFirst
      ? `<td style='text-align:left; vertical-align: top; ${lastRowStyle}' rowspan='${utbetalingsperioder.length}'>${escapeHtml(
          String(pensjonsleverandor)
        )}</td>`
      : ''
    const periodText = periode.sluttAlder
      ? formaterSluttAlderString(intl, periode.startAlder, periode.sluttAlder)
      : formaterLivsvarigString(intl, periode.startAlder)

    const amount = periode.aarligUtbetaling
      ? `${formatInntekt(String(periode.aarligUtbetaling)).replace(/\u00A0/g, ' ')} kr`
      : ''

    rows += `<tr style='${lastRowStyle}'>${produktCell}<td style='text-align:left;'>${escapeHtml(
      periodText
    )}</td><td style='text-align:right;'>${escapeHtml(String(amount))}</td></tr>`
  })

  return rows
}

function getOffentligTpTable({
  offentligTp,
  intl,
}: {
  offentligTp?: OffentligTpResponse
  intl: IntlShape
}): string | undefined {
  if (!offentligTp || !offentligTp.simulertTjenestepensjon) {
    return
  }

  const SPK_URL = 'https://spk.no'
  const { simuleringsresultat, tpLeverandoer } =
    offentligTp.simulertTjenestepensjon
  const { utbetalingsperioder } = simuleringsresultat
  let rows = ''
  let html = '<h3>Offentlig tjenestepensjon</h3>'
  simuleringsresultat.utbetalingsperioder.forEach((periode, index: number) => {
    const isFirst = index === 0
    const isLast = index === utbetalingsperioder.length - 1
    const lastRowStyle =
      isLast || utbetalingsperioder.length > 1
        ? 'border-bottom: none; font-weight: normal'
        : ''

    const produktCell = isFirst
      ? `<td style='text-align:left; vertical-align: top; ${lastRowStyle}' rowspan='${utbetalingsperioder.length}'>${escapeHtml(
          String(tpLeverandoer)
        )}</td>`
      : ''
    const periodText = periode.sluttAlder
      ? formaterSluttAlderString(intl, periode.startAlder, periode.sluttAlder)
      : formaterLivsvarigString(intl, periode.startAlder)

    const amount = periode.aarligUtbetaling
      ? `${formatInntekt(String(periode.aarligUtbetaling)).replace(/\u00A0/g, ' ')} kr`
      : ''

    rows += `<tr style='${lastRowStyle}'>${produktCell}<td style='text-align:left;'>
    ${escapeHtml(
      periodText
    )}</td><td style='text-align:right;'>${escapeHtml(String(amount))}</td></tr>`
  })

  html += `<table class="pdf-table-type2" style="width: 60%"><thead><tr><th style='text-align:left;'>Avtale</th><th style='text-align:left;'>Perioder</th><th style='text-align:right;'>Årlig Beløp</th></tr></thead><tbody>${rows}</tbody></table>`

  html += `<p>${intl.formatMessage(
    { id: 'pensjonsavtaler.offentligtp.spk.afp_ja' },
    {
      ...pdfFormatMessageValues,
      spkLink: (chunks: string[]) =>
        getPdfLink({
          url: SPK_URL,
          displayText: chunks.join('') || 'SPK',
        }),
    }
  )}</p>`
  return rows.length ? html : ''
}
