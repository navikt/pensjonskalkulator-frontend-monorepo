import { format } from 'date-fns'
import { IntlShape } from 'react-intl'

import { formatUttaksalder } from '@/utils/alder'
import { DATE_ENDUSER_FORMAT } from '@/utils/dates'
import { formatInntekt } from '@/utils/inntekt'

import { TableDataRow } from '../TabellVisning/utils'
import { AlderspensjonDetaljerListe } from './BeregningsdetaljerForOvergangskull/hooks'

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
        <h1>Pensjonskalkulator, <span style='font-weight: 200;'>${isEnkel ? 'Enkel' : 'Avansert'} beregning</span></h1>
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
  url: string
  displayText: string
}): string => {
  //const strippedUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '')

  return `<a href="${url}">${displayText}</a>`
}

export function getDetaljerHtmlTable(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  alderspensjonListe: AlderspensjonDetaljerListe[]
): string {
  return ''
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
          url: 'https://nav.no/pensjon/kalkulator/beregning-detaljer',
          displayText: intl.formatMessage({
            id: 'omufoeretrygd.avansert_link',
          }),
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
          link: getPdfLink({
            url: 'https://nav.no/pensjon/kalkulator/beregning-detaljer',
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
      const tmuIngress = `<p>${intl.formatMessage({
        id: 'tidligstmuliguttak.ingress_1',
      })}<b>${formatUttaksalder(intl, tidligstMuligUttak)}.</b>${under75Ingress}</p>`
      return tmuIngress
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
