import { IntlShape } from 'react-intl'

import { formatUttaksalder } from '@/utils/alder'

import { pdfFormatMessageValues } from './utils'

export function getUfoeretrygdIngress({
  intl,
  harHelUT,
  harGradertUT,
  beregningsvalg,
  loependeVedtak,
  normertPensjonsalder,
}: {
  intl: IntlShape
  harHelUT: boolean
  harGradertUT: boolean
  beregningsvalg: Beregningsvalg | null
  loependeVedtak: LoependeVedtak | null
  normertPensjonsalder: {
    aar: number
    maaneder: number
  }
}): string {
  if (harHelUT) {
    return `<p>${intl.formatMessage({
      id: 'beregning.intro.description_2.hel_UT',
    })}</p>`
  }

  if (harGradertUT) {
    if (beregningsvalg === 'med_afp') {
      return `<p>${intl.formatMessage({
        id: 'beregning.intro.description_2.gradert_UT.med_afp',
      })}</p>`
    } else {
      return `<p>${intl.formatMessage(
        {
          id: 'beregning.intro.description_2.gradert_UT.uten_afp',
        },
        {
          ...pdfFormatMessageValues,
          grad: loependeVedtak?.ufoeretrygd.grad,
          normertPensjonsalder: formatUttaksalder(intl, normertPensjonsalder),
        }
      )}</p>`
    }
  }

  return ''
}
