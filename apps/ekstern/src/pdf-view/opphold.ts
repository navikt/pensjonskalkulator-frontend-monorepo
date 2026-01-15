import { IntlShape } from 'react-intl/src/types'

import { getSelectedLanguage } from '@/context/LanguageProvider/utils'
import {
  getTranslatedLandFromLandkode,
  harKravOmArbeidFromLandkode,
} from '@/utils/land'

export const getUtenlandsOppholdIngress = ({
  intl,
  oppholdUtenforNorge,
  sortedUtenlandsperioder,
}: {
  intl: IntlShape
  oppholdUtenforNorge:
    | 'mindre_enn_5_aar'
    | 'mer_enn_5_aar'
    | 'for_lite_trygdetid'
    | 'endring'
  sortedUtenlandsperioder?: Utenlandsperiode[]
}): string => {
  return `<h3>
      ${intl.formatMessage({
        id: `grunnlag.opphold.title.${oppholdUtenforNorge}`,
      })}: ${intl.formatMessage({
        id: `grunnlag.opphold.value.${oppholdUtenforNorge}`,
      })}
    </h3>
    ${sortedUtenlandsperioder && sortedUtenlandsperioder.length ? `<h4 class="utenlandsopphold-title">${intl.formatMessage({ id: 'stegvisning.utenlandsopphold.oppholdene.title' })}</h4>` : ''}
    <div>${getLandList(intl, sortedUtenlandsperioder)}</div>
    <p>${intl.formatMessage({ id: 'grunnlag.opphold.bunntekst' })}</p>`
}

function getLandList(
  intl: IntlShape,
  sortedUtenlandsperioder?: Utenlandsperiode[]
): string {
  const locale = getSelectedLanguage()
  if (!sortedUtenlandsperioder || sortedUtenlandsperioder.length === 0) {
    return ''
  }
  const html = sortedUtenlandsperioder.map((utenlandsperiode) => {
    const harLocalLandKravOmArbeid = harKravOmArbeidFromLandkode(
      utenlandsperiode.landkode
    )
    return `<div class="utenlandsopphold-land-item">
      <div><b>
        ${getTranslatedLandFromLandkode(utenlandsperiode.landkode, locale)}</b>
      </div>
      <div>
       ${intl.formatMessage({ id: 'stegvisning.utenlandsopphold.oppholdene.description.periode' })}
          ${utenlandsperiode.startdato}
          ${
            utenlandsperiode.sluttdato
              ? `–${utenlandsperiode.sluttdato}`
              : ` ${intl.formatMessage({ id: 'stegvisning.utenlandsopphold.oppholdene.description.periode.varig_opphold' })}`
          }
                  
      </div>
      ${
        harLocalLandKravOmArbeid
          ? `<div>
          ${intl.formatMessage({ id: 'stegvisning.utenlandsopphold.oppholdene.description.har_jobbet' })}
          ${intl.formatMessage({
            id: utenlandsperiode.arbeidetUtenlands
              ? 'stegvisning.utenlandsopphold.oppholdene.description.har_jobbet.ja'
              : 'stegvisning.utenlandsopphold.oppholdene.description.har_jobbet.nei',
          })}
        </div>`
          : ''
      }
    </div>`
  })

  return html.join('')
}
