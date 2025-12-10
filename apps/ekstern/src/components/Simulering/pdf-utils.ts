import { format } from 'date-fns'
import { IntlShape } from 'react-intl'

import { formatUttaksalder } from '@/utils/alder'
import { DATE_ENDUSER_FORMAT } from '@/utils/dates'
import { formatInntekt } from '@/utils/inntekt'

import { TableDataRow } from '../TabellVisning/utils'
import { getAfpHeading } from './BeregningsdetaljerForOvergangskull/AfpDetaljerGrunnlag'
import { getAlderspensjonHeading } from './BeregningsdetaljerForOvergangskull/AlderspensjonDetaljerGrunnlag'
import {
  AfpSectionConfig,
  getAfpSectionsToRender,
} from './BeregningsdetaljerForOvergangskull/Felles/AfpDetaljer'
import {
  AfpDetaljerListe,
  AlderspensjonDetaljerListe,
} from './BeregningsdetaljerForOvergangskull/hooks'

const DIN_PENSJON_OPPTJENING_URL = 'https://www.nav.no/pensjon/opptjening'
export const getCurrentDateTimeFormatted = (): string => {
  const now = new Date()

  const date = format(now, DATE_ENDUSER_FORMAT)
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')

  return `${date}, kl. ${hours}.${minutes}`
}

const navLogoSVG = `
<svg width="40" height="12" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="NAV Logo">
<path fill-rule="evenodd" clip-rule="evenodd" d="M39.6751 -2.89721e-07H35.5126C35.5126 -2.89721e-07 35.2257 -2.70858e-07 35.1245 0.256962L32.8213 7.40063L30.5201 0.256962C30.4182 0.000632632 30.1301 0.000632651 30.1301 0.000632651H22.1275C22.0435 0.0012869 21.9631 0.0352452 21.9035 0.0952284C21.8439 0.155212 21.8099 0.236446 21.8088 0.321519V2.74747C21.8088 0.823418 19.7881 0.000632651 18.6044 0.000632651C15.9544 0.000632651 14.1806 1.76899 13.6281 4.45823C13.5981 2.67405 13.4519 2.03481 12.9775 1.38038C12.7594 1.05949 12.445 0.790506 12.1025 0.567088C11.3962 0.148101 10.7618 0.000632651 9.39996 0.000632651H7.79995C7.79995 0.000632651 7.5112 0.000632632 7.40933 0.256962L5.95369 3.91139V0.321519C5.95288 0.236778 5.91932 0.155732 5.86021 0.0957491C5.80109 0.0357666 5.72112 0.00162176 5.63744 0.000632651H1.93555C1.93555 0.000632651 1.64992 0.000632632 1.54554 0.256962L0.0330355 4.05696C0.0330355 4.05696 -0.118215 4.43671 0.226787 4.43671H1.64992V11.6772C1.64992 11.857 1.78929 12 1.96742 12H5.63619C5.67797 11.9999 5.71932 11.9915 5.75789 11.9752C5.79645 11.959 5.83147 11.9352 5.86096 11.9052C5.89044 11.8752 5.9138 11.8397 5.92972 11.8005C5.94563 11.7614 5.95377 11.7195 5.95369 11.6772V4.43671H7.38433C8.20496 4.43671 8.37808 4.45949 8.69746 4.61013C8.88996 4.68418 9.06308 4.83291 9.15808 5.00443C9.35184 5.37342 9.39996 5.81646 9.39996 7.12342V11.6772C9.39996 11.857 9.54246 12 9.71871 12H13.235C13.235 12 13.6325 12 13.7894 11.6013L14.5687 9.65C15.605 11.1209 17.3106 11.9994 19.4306 11.9994H19.8938C19.8938 11.9994 20.2938 11.9994 20.4519 11.6019L21.8094 8.1962V11.6772C21.8094 11.7628 21.843 11.8449 21.9028 11.9055C21.9625 11.966 22.0436 12 22.1282 12H25.7175C25.7175 12 26.1138 12 26.2726 11.6013C26.2726 11.6013 27.7082 7.99051 27.7138 7.96329H27.7163C27.7713 7.66266 27.3969 7.66266 27.3969 7.66266H26.1157V1.46582L30.1469 11.6019C30.3038 11.9994 30.7007 11.9994 30.7007 11.9994H34.942C34.942 11.9994 35.3407 11.9994 35.4982 11.6019L39.9676 0.38924C40.122 0.000632614 39.6745 0.000632651 39.6745 0.000632651L39.6751 -2.89721e-07ZM21.8082 7.66329H19.3969C18.9352 7.66329 18.4925 7.47758 18.1661 7.14702C17.8396 6.81646 17.6563 6.36812 17.6563 5.90063C17.6563 5.43315 17.8396 4.98481 18.1661 4.65425C18.4925 4.32368 18.9352 4.13797 19.3969 4.13797H20.0713C20.5324 4.13931 20.9743 4.32573 21.3 4.65636C21.6256 4.987 21.8086 5.4349 21.8088 5.9019L21.8082 7.66329Z" fill="#C30000"/>
</svg>
`
const informationSquareIcon = `
<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.70996 1.57788C9.91106 1.57788 10.0742 1.74103 10.0742 1.94214V9.70972C10.0742 9.91082 9.91106 10.074 9.70996 10.074H1.94238C1.74128 10.074 1.57812 9.91082 1.57812 9.70972V1.94214C1.57812 1.74103 1.74128 1.57788 1.94238 1.57788H9.70996ZM5.09766 4.85522C4.89679 4.85548 4.73344 5.01857 4.7334 5.21948C4.73355 5.4203 4.89686 5.58349 5.09766 5.58374H5.46191V7.52515H5.09766C4.89682 7.5254 4.73349 7.68853 4.7334 7.8894C4.7334 8.09035 4.89677 8.25341 5.09766 8.25366H6.55469C6.75564 8.25348 6.91895 8.09039 6.91895 7.8894C6.91886 7.68849 6.75558 7.52533 6.55469 7.52515H6.19043V5.21948C6.19039 5.01844 6.02721 4.85527 5.82617 4.85522H5.09766ZM5.82617 3.2771C5.55827 3.27726 5.34098 3.49455 5.34082 3.76245C5.34082 4.03049 5.55817 4.24764 5.82617 4.2478C6.09427 4.24776 6.31152 4.03056 6.31152 3.76245C6.31136 3.49448 6.09417 3.27715 5.82617 3.2771Z" fill="#236B7D"/>
</svg>
`
export const getPdfHeadingWithLogo = (isEnkel: boolean): string => {
  return `<table role='presentation' style='width: 100%; margin-bottom: 1em;'>
    <tr class="header-with-logo">
      <td style='width: 70%;'>
        <h1>Pensjonskalkulator: <span style='font-weight: 200;'>${isEnkel ? 'Enkel' : 'Avansert'} beregning</span></h1>
      </td>
      <td style='text-align: right; width: 30%;'>
        <span class='logoContainer'>
          ${navLogoSVG}
        </span>
      </td>
    </tr>
  </table>`
}

export const getPdfLink = ({
  url,
  displayText,
}: {
  url?: string
  displayText: string
}): string => {
  if (!url) return displayText
  return `<a href="${url}">${displayText}</a>`
}

function getAfpIngress(
  intl: IntlShape,
  title: string,
  content: string
): string {
  return `
  <h3>${intl.formatMessage({ id: 'grunnlag.afp.title' })}: ${title}</h3>
  <p>${intl.formatMessage(
    { id: content },
    {
      ...pdfFormatMessageValues,
      afpLink: (chunks: string[]) =>
        getPdfLink({
          url: 'https://www.afp.no',
          displayText: chunks.join('') || 'Fellesordningen for AFP',
        }),
      ufoeretrygdOgAfpLink: (chunks: string[]) =>
        getPdfLink({
          url: 'https://www.nav.no/ufor-til-pensjon#afp',
          displayText: chunks.join('') || 'Uføretrygd og AFP',
        }),
      goToAFP: (chunks: string[]) =>
        getPdfLink({
          displayText: chunks.join('') || 'AFP (avtalefestet pensjon)',
        }),
      goToAvansert: () => '',
    }
  )}
  </p>`
}

export function getAfpDetaljerHtmlTable({
  afpDetaljerListe,
  intl,
  uttaksalder,
  gradertUttaksperiode,
  shouldHideAfpHeading,
}: {
  afpDetaljerListe: AfpDetaljerListe[] | undefined
  intl: IntlShape
  uttaksalder: Alder | null
  gradertUttaksperiode: GradertUttak | null
  shouldHideAfpHeading: boolean
}): string {
  if (!afpDetaljerListe) {
    return ''
  }

  // For each AfpDetaljer entry, render its sections and concatenate HTML
  return afpDetaljerListe
    .map((afpDetaljForValgtUttak, index) => {
      const afpHeading =
        !shouldHideAfpHeading &&
        getAfpHeading({
          afpDetaljForValgtUttak,
          index,
          uttaksalder,
          gradertUttaksperiode,
        })

      const headingHtml = afpHeading
        ? `<h4>${intl.formatMessage(
            { id: afpHeading.messageId },
            {
              alderAar: `${afpHeading.age} år`,
              alderMd:
                afpHeading.months && afpHeading.months > 0
                  ? `og ${afpHeading.months} måneder`
                  : '',
            }
          )}</h4>`
        : ''
      const sections = getAfpSectionsToRender(afpDetaljForValgtUttak)
      const sectionHtml = sections
        .map((afpSection) => {
          const sectionWithTitle: AfpSectionConfig = {
            ...afpSection,
            titleId: afpSection.titleId
              ? intl.formatMessage({ id: afpSection.titleId })
              : '',
          }
          return getAfpTable(sectionWithTitle)
        })
        .join('')

      return `${headingHtml}${sectionHtml}`
    })
    .join('')
}

function getAfpTable(afpSection: AfpSectionConfig): string {
  if (!Array.isArray(afpSection.data) || afpSection.data.length === 0) return ''

  const { titleId, boldLastItem, data, noBorderBottom, allItemsBold } =
    afpSection
  const rows = afpSection.data
    .map((detalj) => {
      const lastItem = detalj === data[data.length - 1]
      const label = detalj?.tekst ?? ''
      const value = detalj?.verdi ?? ''
      const boldStyle =
        allItemsBold || (boldLastItem && lastItem) ? 'font-weight: bold;' : ''
      const noBorderBottomStyle =
        noBorderBottom || lastItem ? 'border-bottom: none;' : ''
      return `<tr style='${noBorderBottomStyle}'><td style='text-align:left; ${boldStyle}'>${escapeHtml(String(label))}:</td><td style='text-align:right; ${boldStyle}'>${escapeHtml(
        String(value)
      )}</td></tr>`
    })
    .join('\n')

  return `<div style='margin:0; width: 33%;'>
        ${titleId ? `<h4 class="afp-grunnlag-title">${titleId}</h4>` : ''}
      <table role='presentation'>${rows}</table>
    </div>`
}

export function getAldersPensjonDetaljerHtmlTable(
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

function escapeHtml(input: string): string {
  if (input === null || input === undefined) return ''
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function getForbeholdAvsnitt(intl: IntlShape): string {
  const forbeholdUrl = 'https://nav.no/pensjon/kalkulator/forbehold'
  const kalkulatorUrl = 'https://nav.no/pensjon/kalkulator'

  return `<div>
    <p class="pdf-metadata">
      <b>${intl.formatMessage({ id: 'grunnlag.forbehold.title' })}: </b>
      ${intl.formatMessage({ id: 'grunnlag.forbehold.ingress_1' })}
      <br/>${getPdfLink({ url: forbeholdUrl, displayText: intl.formatMessage({ id: 'grunnlag.forbehold.link' }) })}
    </p>
    <p>
      <b>NB: </b>
      ${intl.formatMessage({ id: 'grunnlag.forbehold.ingress_2' })}
      ${getPdfLink({ url: kalkulatorUrl, displayText: 'Gå til pensjonskalkulator' })}
    </p>
  </div>`
}

export function getChartTable({
  tableData,
  intl,
}: {
  tableData: TableDataRow[]
  intl: IntlShape
}): string {
  const tableHeading = `<h3>Årlig inntekt og pensjon</h3><div class="pdf-metadata">${intl.formatMessage({ id: 'beregning.intro.description_1.endring' })}</div>`

  let tableHtml = `<table><thead><tr><th>Alder</th><th>Sum (kr)</th>`

  const detailNames = Array.from(
    new Set(tableData.flatMap((row) => row.detaljer.map((d) => d.name)))
  )
  detailNames.forEach((name) => {
    tableHtml += `<th>${name}</th>`
  })
  tableHtml += '</tr></thead><tbody>'

  tableData.forEach((row) => {
    tableHtml += `<tr><th>${row.alder}</th><td style="text-align: right;">${formatInntekt(row.sum).replace(/\u00A0/g, ' ')}</td>`
    detailNames.forEach((name) => {
      const detail = row.detaljer.find((d) => d.name === name)
      const amount =
        detail && detail.subSum
          ? `${formatInntekt(detail.subSum).replace(/\u00A0/g, ' ')} kr`
          : ''

      tableHtml += `<td>${amount.replace(/\u00A0/g, ' ')}</td>`
    })
    tableHtml += '</tr>'
  })

  tableHtml += '</tbody></table>'
  return tableHeading + tableHtml
}

export function getTidligstMuligUttakIngressContent({
  intl,
  normertPensjonsalder,
  nedreAldersgrense,
  loependeVedtakPre2025OffentligAfp,
  isOver75AndNoLoependeVedtak,
  show1963Text,
  ufoeregrad,
  hasAFP,
  tidligstMuligUttak,
}: {
  intl: IntlShape
  normertPensjonsalder: Alder
  nedreAldersgrense: Alder
  loependeVedtakPre2025OffentligAfp: boolean
  isOver75AndNoLoependeVedtak: boolean
  show1963Text: boolean
  ufoeregrad: number
  hasAFP: boolean
  tidligstMuligUttak?: Alder
}): string {
  if (ufoeregrad) {
    const gradertIngress = hasAFP
      ? 'omufoeretrygd.gradert.ingress.afp'
      : 'omufoeretrygd.gradert.ingress'
    const formatertNedreAldersgrense = formatUttaksalder(
      intl,
      nedreAldersgrense
    )
    const formatertNormertPensjonsalder = formatUttaksalder(
      intl,
      normertPensjonsalder
    )

    const ingressId =
      ufoeregrad === 100 ? 'omufoeretrygd.hel.ingress' : gradertIngress

    const formattedGradertIngress = intl.formatMessage(
      { id: ingressId },
      {
        ...pdfFormatMessageValues,
        grad: ufoeregrad,
        nedreAldersgrense: formatertNedreAldersgrense,
        normertPensjonsalder: formatertNormertPensjonsalder,
        link: getPdfLink({
          displayText: 'Avansert',
        }),
      }
    )
    return `<p>${formattedGradertIngress}</p>`
  }

  if (loependeVedtakPre2025OffentligAfp && !tidligstMuligUttak) {
    tidligstMuligUttak = {
      aar: 67,
      maaneder: 0,
    }
  }

  if (tidligstMuligUttak) {
    if (loependeVedtakPre2025OffentligAfp) {
      return `<p>
      ${intl.formatMessage(
        { id: 'tidligstmuliguttak.pre2025OffentligAfp.ingress' },
        {
          ...pdfFormatMessageValues,
          link: getPdfLink({
            displayText: intl.formatMessage({
              id: 'tidligstmuliguttak.pre2025OffentligAfp.avansert_link',
            }),
          }),
        }
      )}</p>`
    } else {
      const messageId = `tidligstmuliguttak.${show1963Text ? '1963' : '1964'}.ingress_2`
      const under75Ingress = !isOver75AndNoLoependeVedtak
        ? intl.formatMessage({ id: messageId })
        : ''
      return `<p>${intl.formatMessage({
        id: 'tidligstmuliguttak.ingress_1',
      })}<b>${formatUttaksalder(intl, tidligstMuligUttak)}.</b>${under75Ingress}</p>`
    }
  }

  return ''
}

const pdfFormatMessageValues = {
  br: '<br/>',
  strong: (chunks: string[]) => `<strong>${chunks.join('')}</strong>`,
  nowrap: (chunks: string[]) =>
    `<span class="nowrap">${chunks.join('')}</span>`,
}

export function getOmstillingsstoenadAlert(
  intl: IntlShape,
  normertPensjonsalder: Alder
): string {
  const formatertNormertPensjonsalder = formatUttaksalder(
    intl,
    normertPensjonsalder
  )
  const telefonNummer = intl.formatMessage({ id: 'link.telefon_pensjon' })
  const linkHtml = `<span>${telefonNummer}</span>`

  const alertMessage = intl.formatMessage(
    { id: 'tidligstmuliguttak.info_omstillingsstoenad_og_gjenlevende' },
    {
      ...pdfFormatMessageValues,
      normertPensjonsalder: formatertNormertPensjonsalder,
      link: linkHtml,
    }
  )

  return `<table role='presentation' class='alert-box' style='width: 100%; margin-bottom: 1em;'>
    <tr>
      <td style='width: 20px; vertical-align: top; padding: 16px 8px 16px 16px; margin: 0; border: none;'>
        <span class='infoIconContainer'>
          ${informationSquareIcon}
        </span>
      </td>
      <td style='vertical-align: top; padding: 16px 16px 16px 8px; margin: 0; text-align: left; border: none;'>
        <p style='margin: 0; padding: 0;'>${alertMessage}</p>
      </td>
    </tr>
  </table>`
}

export function getGrunnlagIngress({
  intl,
  alderspensjonDetaljerListe,
  aarligInntektFoerUttakBeloepFraSkatt,
  afpDetaljerListe,
  title,
  content,
  hasPre2025OffentligAfpUttaksalder,
  uttaksalder,
  gradertUttaksperiode,
  shouldHideAfpHeading,
}: {
  intl: IntlShape
  alderspensjonDetaljerListe: AlderspensjonDetaljerListe[]
  afpDetaljerListe: AfpDetaljerListe[]
  aarligInntektFoerUttakBeloepFraSkatt?: {
    beloep: string
    aar: number
  }
  title?: string
  content?: string
  hasPre2025OffentligAfpUttaksalder: boolean
  uttaksalder: Alder | null
  gradertUttaksperiode: GradertUttak | null
  shouldHideAfpHeading: boolean
}): string {
  const beloepRaw = aarligInntektFoerUttakBeloepFraSkatt?.beloep
  const aarRaw = aarligInntektFoerUttakBeloepFraSkatt?.aar

  const beloepFormatted = beloepRaw
    ? formatInntekt(String(beloepRaw)).replace(/\u00A0/g, ' ')
    : ''
  const aarFormatted = aarRaw != null ? String(aarRaw) : ''

  const inntektBeloepOgÅr = intl.formatMessage(
    { id: 'grunnlag.inntekt.ingress' },
    {
      ...pdfFormatMessageValues,
      beloep: beloepFormatted,
      aar: aarFormatted,
      dinPensjonBeholdningLink: (chunks: string[]) =>
        getPdfLink({
          url: DIN_PENSJON_OPPTJENING_URL,
          displayText: chunks.join('') || 'Din pensjonsopptjening',
        }),
    }
  )
  return `<h2>${intl.formatMessage({ id: 'grunnlag.title' })}</h2>
  <h3>${intl.formatMessage({ id: 'grunnlag2.endre_inntekt.title' })}</h3>
  <p>${inntektBeloepOgÅr} avansert kalkulator.</p>
  <h3>Alderspensjon (Nav)</h3>
  <p>
    ${intl.formatMessage(
      { id: 'grunnlag.alderspensjon.ingress' },
      {
        avansert: '',
      }
    )}
  </p>
  
  ${alderspensjonDetaljerListe
    .map((alderspensjonVedUttaksValg, index) => {
      const apHeading = getAlderspensjonHeading({
        index,
        hasPre2025OffentligAfpUttaksalder,
        uttaksalder,
        gradertUttaksperiode,
      })
      const headingHtml = `<h4>${intl.formatMessage(
        {
          id: apHeading.messageId,
        },
        {
          alderAar: apHeading.age,
          alderMd: apHeading.months,
          grad: apHeading.grad,
        }
      )}
    </h4>`
      return `${headingHtml}${getAldersPensjonDetaljerHtmlTable(alderspensjonVedUttaksValg)}`
    })
    .join('')}
  <div>${getPdfLink({
    url: DIN_PENSJON_OPPTJENING_URL,
    displayText: 'Din pensjonsopptjening',
  })}</div>
  <div>${getPdfLink({
    url: 'https://www.nav.no/alderspensjon#beregning',
    displayText: 'Om reglene for alderspensjon ',
  })}
  </div>
  ${getAfpIngress(intl, title || '', content || '')}
  ${getAfpDetaljerHtmlTable({ afpDetaljerListe, intl, uttaksalder, gradertUttaksperiode, shouldHideAfpHeading })}
  `
}
