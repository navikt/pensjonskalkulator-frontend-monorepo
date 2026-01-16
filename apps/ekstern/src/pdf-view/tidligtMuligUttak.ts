import { IntlShape } from 'react-intl'

import { formatUttaksalder } from '@/utils/alder'

import { getPdfLink, pdfFormatMessageValues } from './utils'

export function getTidligstMuligUttakIngress({
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
