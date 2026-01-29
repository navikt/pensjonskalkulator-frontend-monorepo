import { IntlShape } from 'react-intl/src/types'

import { getPdfLink, pdfFormatMessageValues } from './utils'

export const getSivilstandIngress = ({
  intl,
  formatertSivilstand,
}: {
  intl: IntlShape
  formatertSivilstand: string
}): string => {
  const GARANTI_PENSJON_URL = 'https://nav.no/minstepensjon'

  return `<div>
    <div><b>${intl.formatMessage({ id: 'grunnlag.sivilstand.title' })}: </b>${formatertSivilstand}</div>
    <p>${intl.formatMessage(
      { id: 'grunnlag.sivilstand.ingress' },
      {
        ...pdfFormatMessageValues,
        garantiPensjonLink: (chunks: string[]) =>
          getPdfLink({
            url: GARANTI_PENSJON_URL,
            displayText: chunks.join('') || 'Om garantipensjon og satser',
          }),
      }
    )}
    </p>
  </div>`
}
