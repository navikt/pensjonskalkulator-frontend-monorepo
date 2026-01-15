import { IntlShape } from 'react-intl'

import { getAfpHeading } from '@/components/Simulering/BeregningsdetaljerForOvergangskull/AfpDetaljerGrunnlag'
import {
  AfpSectionConfig,
  getAfpSectionsToRender,
} from '@/components/Simulering/BeregningsdetaljerForOvergangskull/Felles/AfpDetaljer'
import { AfpDetaljerListe } from '@/components/Simulering/BeregningsdetaljerForOvergangskull/hooks'

import { escapeHtml, getPdfLink, pdfFormatMessageValues } from './utils'

export function getAfpIngress(
  intl: IntlShape,
  title: string,
  content: string
): string {
  return `<h3>
    ${intl.formatMessage({ id: 'grunnlag.afp.title' })}: ${title}
  </h3>
  <p>
    ${intl.formatMessage(
      { id: content },
      {
        ...pdfFormatMessageValues,
        afpLink: (chunks: string[]) =>
          getPdfLink({
            url: 'https://afp.no',
            displayText: chunks.join('') || 'Fellesordningen for AFP',
          }),
        ufoeretrygdOgAfpLink: (chunks: string[]) =>
          getPdfLink({
            url: 'https://nav.no/ufor-til-pensjon#afp',
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

export function getAfpDetaljerTable({
  afpDetaljerListe,
  intl,
  uttaksalder,
  gradertUttaksperiode,
  shouldHideAfpHeading,
}: {
  afpDetaljerListe?: AfpDetaljerListe[]
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

      const afpHeadingHtml = afpHeading
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

      const afpSections = getAfpSectionsToRender(afpDetaljForValgtUttak)
      const afpSectionsHtml = afpSections
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

      return `${afpHeadingHtml}${afpSectionsHtml}`
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
      return `<tr style='${noBorderBottomStyle}'>
            <td style='text-align:left; ${boldStyle}'>
                ${escapeHtml(String(label))}:
            </td>
            <td style='text-align:right; ${boldStyle}'>
                ${escapeHtml(String(value))}
            </td>
          </tr>`
    })
    .join('\n')

  return `<div style='margin:0; width: 33%;'>
        ${titleId ? `<h4 class="afp-grunnlag-title">${titleId}</h4>` : ''}
      <table role='presentation'>${rows}</table>
    </div>`
}
