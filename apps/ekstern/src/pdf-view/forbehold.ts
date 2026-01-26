import { IntlShape } from 'react-intl'

import { getPdfLink } from './utils'

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
  </div>
  <hr role="presentation"/>`
}
